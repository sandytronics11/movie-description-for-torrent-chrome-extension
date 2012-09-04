imdbUrl = "http://www.imdb.com";

function getRatingFromIMDB(contentNode) {
	var rating = null;
	try {
		rating = contentNode.find(".star-box-details").children(":first").text();
		rating = parseFloat(rating);
	} catch (err) {
		console.warn("Can't extract imdb rating: " + err);
	}
	return rating;
}

function removeMetaHtmlAttrs(node, what) {
	var what = [ "id", "itemprop", "itemscope", "itemtype", "onclick"];
	for (i in what) {
		node.find("*").removeAttr(what[i]);
	}
}

function extractDataFromMoviePage(n, movieId) {
	if (n.length == 0) {
		return $("<p>Can't extract data - looks like IMDB layout problem :(</p>");
	}
	n.find("#img_primary,#share-checkin,#share-popover,#prometer_container,#overview-bottom").remove();
	n.find("img").remove();
	n.find(".rightcornerlink,.star-box-rating-widget,.star-box-giga-star,.clear").remove();
	n.find("p:empty").remove();

	if (!opts.Integration.Display_detailed_informations) {
		n.find(".txt-block").remove();
	}

	n.find("h4").each(function() {
		$(this).replaceWith($("<strong>" + $(this).text() + "</strong>"));
	});
	n.find("h1").each(function() {
		$(this).replaceWith($("<h3><a href='" + movieId + "'> " + $(this).text() + "</a><h3>"));
	});
	removeMetaHtmlAttrs(n);
	//WRONG
	makeHrefAbsolute(imdbUrl, n);
	return $("<div>" + removeNewLines(n.html()) + "</div>");
}

function extractPossibleData(_movieNode, data, movie) {
	var nodeHtml = "<div>";
	var mainNode = $(data).find("#main");
	mainNode.find(".show-hide").remove();

	var possibleMovies = new Array();
	mainNode.find("table").each(function() {
		var titleTitle = $(this).prev().text().trim();
		if (titleTitle.length == 0) {
			return;
		}
		titleTitle = removeOnlyBrackets(titleTitle);
		titleTitle = titleTitle.replace(/titles/gi, "");
		titleTitle = titleTitle.replace(new RegExp("Displaying.+?(Results|Result)", "gi"), "");

		titleTitle = titleTitle.trim();
		var wrongSections = [ "Keywords Approx Matches", "Companies Approx Matches", "Names Approx Matches" ];
		if (containsAny(titleTitle, wrongSections)) {
			return;
		}

		var isHeaderAdded = false;
		var tds = $(this).find("tbody > tr > td:nth-child(3)");
		var total = 0;
		tds.each(function() {
			if (total > 3) {
				return;
			}
			var n = $(this);
			n.find("a").removeAttr("onclick");
			n.find("br,img").remove();
			n.find("a:empty").remove();

			n.find("p").each(function() {
				$(this).replaceWith("<div>" + $(this).text() + "</div>");
			});

			var year = n.contents().filter(function() {
				return this.nodeType == Node.TEXT_NODE;
			}).text();

			year = year + " " + n.find("small").text();

			var wrongTypes = [ "TV", "VG", "TV series" ];
			if (containsAny(year, wrongTypes)) {
				return;
			}
			if (movie.year != null) {
				if (year.indexOf(movie.year) == -1) {
					return;
				}
			}
			if (!isHeaderAdded) {
				nodeHtml = nodeHtml + "<div><h3>" + titleTitle + "</h3><ul>";
				isHeaderAdded = true;
			}
			total++;
			possibleMovies.push(n.find("a[href^='/title/tt']").attr("href"));
			nodeHtml = nodeHtml + "<li>" + n.html().trim() + "</li>";
		});

		if (isHeaderAdded) {
			nodeHtml = nodeHtml + "</ul></div>";
		}
	});
	nodeHtml = nodeHtml + "</div>";
	if (nodeHtml.length < 20) {
		nodeHtml = "";
	}

	if (possibleMovies.length == 1) {
		console.log("[IMDB] there is only movie on main search, displaying that movie");
		callImdbForMovie(_movieNode, movie, possibleMovies[0]);
		return null;
	}

	var contentNode = $(nodeHtml);
	makeHrefAbsolute(imdbUrl, contentNode);
	return contentNode;
}

function callImdbForMovie(movieNode, Movie, movieId) {

	var theUrl = imdbUrl + movieId;

	callAjax("callImdbForMovie", {
		url : theUrl,
		beforeSend : function(xhr) {
			console.log("[IMDB] callImdbForMovie with url=" + theUrl);
		},
		success : function(data) {
			var contentNode = $(data).find("#overview-top");
			contentNode = extractDataFromMoviePage(contentNode, movieId);
			
			var rating = getRatingFromIMDB(contentNode);
			contentNode.find("*").removeAttr("class");
			imdbCache.addMovie(Movie, contentNode.html(), rating);
			updateMovieSection(movieNode, contentNode.html(), Movie, rating, opts.IMDB);

		},
		failure : function(data) {
			replaceWith(filmwebNode, "Can't connect to IMDB");
		}
	});

}

function callImdbForAnything(movieNode, Movie) {

	var params = {
		s : Movie.title
	};

	if (Movie.year == null) {
		params["q"] = Movie.title;
	} else {
		params["q"] = Movie.title + " (" + Movie.year + ")";
	}

	var theUrl = imdbUrl + "/find?" + $.param(params);

	callAjax("callImdbForAnything", {
		url : theUrl,
		beforeSend : function(xhr) {
			console.log("[IMDB] callImdbForAnything " + JSON.stringify(Movie) + " with url=" + theUrl);
		},
		success : function(data) {
			var contentNode = extractPossibleData(movieNode, data, Movie);
			if (contentNode != null) {
				var rating = getRatingFromIMDB(contentNode);
				contentNode.find("*").removeAttr("class");
				imdbCache.addMovie(Movie, contentNode.html(), rating);
				updateMovieSection(movieNode, contentNode.html(), Movie, rating, opts.IMDB);
			}
		},
		failure : function(data) {
			replaceWith(filmwebNode, "Can't connect to IMDB");
		}
	});
}

function callImdbForSpecialTitle(movieNode, Movie) {

	var params = {
		title : Movie.title,
		title_type : "feature"
	};

	var theUrl = imdbUrl + "/search/title?" + $.param(params);

	callAjax("callImdbForSpecialTitle", {
		url : theUrl,
		beforeSend : function(xhr) {
			console.log("[IMDB] callImdbForSpecialTitle " + JSON.stringify(Movie) + " with url=" + theUrl);
		},
		success : function(data) {
			var content = $(data).find("#main").find("table").find(".title");
			if (content.length == 0) {
				callImdbForAnything(movieNode, Movie);
			} else {

				var movieId = null;
				content.each(function() {
					if (movieId != null) {
						return;
					}
					var linkNode = $(this).find("a[href^='/title/tt']");

					if (Movie.year == null) {
						movieId = linkNode.attr("href");
					} else {
						var yearNode = $(this).find(".year_type");
						var year = removeOnlyBrackets(yearNode.text());
						if (year.indexOf(Movie.year) >= 0) {
							movieId = linkNode.attr("href");
						}
					}
				});
				if (movieId != null) {
					callImdbForMovie(movieNode, Movie, movieId);
				} else {
					callImdbForAnything(movieNode, Movie);
				}
			}
		},
		failure : function(data) {
			replaceWith(filmwebNode, "Can't connect to IMDB");
		}
	});
}

function callImdbForFirstHit(movieNode, Movie) {

	var params = {
		s : Movie.title
	};

	if (Movie.year == null) {
		params["q"] = Movie.title;
	} else {
		params["q"] = Movie.title + " (" + Movie.year + ")";
	}

	var theUrl = imdbUrl + "/find?" + $.param(params);

	callAjax("callImdbForFirstHit", {
		url : theUrl,
		beforeSend : function(xhr) {
			console.log("[IMDB] callImdbForFirstHit: " + JSON.stringify(Movie) + " with url=" + theUrl);
		},
		success : function(data) {
			var contentNode = $(data).find("#overview-top");
			if (contentNode.length > 0) {
				contentNode = extractDataFromMoviePage(contentNode, "need_to_fix_this");
				var rating = getRatingFromIMDB(contentNode);
				contentNode.find("*").removeAttr("class");
				imdbCache.addMovie(Movie, contentNode.html(), rating);
				updateMovieSection(movieNode, contentNode.html(), Movie, rating, opts.IMDB);
			} else {
				callImdbForSpecialTitle(movieNode, Movie);
			}

		},
		failure : function(data) {
			replaceWith(filmwebNode, "Can't connect to IMDB");
		}
	});

}

function callImdb(movieNode, movie) {

	var cachedMovie = imdbCache.getFromCache(movie);
	if (cachedMovie != undefined) {
		updateMovieSection(movieNode, cachedMovie.content, movie, cachedMovie.rating, opts.IMDB);
	} else {
		callImdbForFirstHit(movieNode, movie);
	}
}
var imdbUrl = "http://www.imdb.com";

function removeMetaHtmlAttrs(node, what) {
	what = [ "id", "itemprop", "itemscope", "itemtype", "onclick" ];
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
	makeHrefAbsolute(imdbUrl, n);
	return $("<div>" + removeNewLines(n.html()) + "</div>");
}

function extractPossibleData(_movieNode, data, movie) {
	nodeHtml = "<div>";
	mainNode = $(data).find("#main");
	mainNode.find(".show-hide").remove();

	possibleMovies = new Array();
	mainNode.find("table").each(function() {
		titleTitle = $(this).prev().text().trim();
		if (titleTitle.length == 0) {
			return;
		}
		titleTitle = removeOnlyBrackets(titleTitle);
		titleTitle = titleTitle.replace(/titles/gi, "");
		titleTitle = titleTitle.replace(new RegExp("Displaying.+?(Results|Result)", "gi"), "");

		titleTitle = titleTitle.trim();
		wrongSections = [ "Keywords Approx Matches", "Companies Approx Matches", "Names Approx Matches" ];
		if (containsAny(titleTitle, wrongSections)) {
			return;
		}

		isHeaderAdded = false;
		tds = $(this).find("tbody > tr > td:nth-child(3)");
		total = 0;
		tds.each(function() {
			if (total > 3) {
				return;
			}
			n = $(this);
			n.find("a").removeAttr("onclick");
			n.find("br").remove();
			n.find("img").remove();
			n.find("a:empty").remove();

			n.find("p").each(function() {
				$(this).replaceWith("<div>" + $(this).text() + "</div>");
			});

			year = n.contents().filter(function() {
				return this.nodeType == Node.TEXT_NODE;
			}).text();

			year = year + " " + n.find("small").text();

			wrongTypes = [ "TV", "VG", "TV series" ];
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
			total = total + 1;
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

	contentNode = $(nodeHtml);
	makeHrefAbsolute(imdbUrl, contentNode);
	return contentNode;
}

function callImdbForMovie(_movieNode, _movie, _movieId) {

	var Movie = _movie;
	var movieNode = _movieNode;
	var theUrl = imdbUrl + _movieId;
	var movieId = _movieId;

	callOpts = {
		url : theUrl,
		beforeSend : function(xhr) {
			console.log("[IMDB] Call to get (callImdbForMovie) movie with url=" + theUrl);
		},
		success : function(data) {
			contentNode = $(data).find("#overview-top");
			contentNode = extractDataFromMoviePage(contentNode, movieId);
			imdbCache.addMovie(Movie, contentNode.html());
			updateMovieSection(movieNode, contentNode, null);
		},
		failure : function(data) {
			replaceWith(filmwebNode, "Can't connect to IMDB");
		}
	};

	if (opts.Integration.Download_one_movie_descryption_at_a_time) {
		$.ajaxq("callImdbForMovie", callOpts);
	} else {
		$.ajax(callOpts);
	}

}

function callImdbForAnything(_movieNode, _movie) {
	var movieNode = _movieNode;
	var Movie = _movie;

	params = {
		s : Movie.title
	};

	if (Movie.year == null) {
		params["q"] = Movie.title;
	} else {
		params["q"] = Movie.title + " (" + Movie.year + ")";
	}

	var theUrl = imdbUrl + "/find?" + $.param(params);

	callOpts = {
		url : theUrl,
		beforeSend : function(xhr) {
			console.log("[IMDB] Call to get (callImdbForAnything) " + JSON.stringify(Movie) + " with url=" + theUrl);
		},
		success : function(data) {
			contentNode = extractPossibleData(movieNode, data, Movie);
			if (contentNode != null) {
				imdbCache.addMovie(Movie, contentNode.html());
				updateMovieSection(movieNode, contentNode, Movie);
			}
		},
		failure : function(data) {
			replaceWith(filmwebNode, "Can't connect to IMDB");
		}
	};

	if (opts.Integration.Download_one_movie_descryption_at_a_time) {
		$.ajaxq("callImdbForAnything", callOpts);
	} else {
		$.ajax(callOpts);
	}
}

function callImdbForSpecialTitle(_movieNode, _movie) {

	var movieNode = _movieNode;
	var Movie = _movie;
	params = {
		title : Movie.title,
		title_type : "feature"
	};

	var theUrl = imdbUrl + "/search/title?" + $.param(params);

	callOpts = {
		url : theUrl,
		beforeSend : function(xhr) {
			console.log("[IMDB] Call to get (callImdbForSpecialTitle) " + JSON.stringify(Movie) + " with url=" + theUrl);
		},
		success : function(data) {
			content = $(data).find("#main").find("table").find(".title");
			if (content.length == 0) {
				callImdbForAnything(movieNode, Movie);
			} else {

				movieId = null;
				content.each(function() {
					if (movieId != null) {
						return;
					}
					linkNode = $(this).find("a[href^='/title/tt']");

					if (Movie.year == null) {
						movieId = linkNode.attr("href");
					} else {
						yearNode = $(this).find(".year_type");
						year = removeOnlyBrackets(yearNode.text());
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
	};

	if (opts.Integration.Download_one_movie_descryption_at_a_time) {
		$.ajaxq("callImdbForSpecialTitle", callOpts);
	} else {
		$.ajax(callOpts);
	}
}

function callImdbForFirstHit(_movieNode, _movie) {
	var movieNode = _movieNode;
	var Movie = _movie;

	params = {
		s : Movie.title
	};

	if (Movie.year == null) {
		params["q"] = Movie.title;
	} else {
		params["q"] = Movie.title + " (" + Movie.year + ")";
	}

	var theUrl = imdbUrl + "/find?" + $.param(params);

	callOpts = {
		url : theUrl,
		beforeSend : function(xhr) {
			console.log("[IMDB] Call to get (callImdbForFirstHit) " + JSON.stringify(Movie) + " with url=" + theUrl);
		},
		success : function(data) {
			contentNode = $(data).find("#overview-top");
			if (contentNode.length > 0) {
				contentNode = extractDataFromMoviePage(contentNode, "TODO");
				imdbCache.addMovie(Movie, contentNode.html());
				updateMovieSection(movieNode, contentNode, Movie);
			} else {
				callImdbForSpecialTitle(movieNode, Movie);
			}

		},
		failure : function(data) {
			replaceWith(filmwebNode, "Can't connect to IMDB");
		}
	};

	if (opts.Integration.Download_one_movie_descryption_at_a_time) {
		$.ajaxq("callImdbForFirstHit", callOpts);
	} else {
		$.ajax(callOpts);
	}
}

function callImdb(movieNode, movie) {

	cachedContentNode = imdbCache.getFromCache(movie);
	if (cachedContentNode != undefined) {
		updateMovieSection(movieNode, $("<div></div>").append(cachedContentNode), movie);
	} else {
		callImdbForFirstHit(movieNode, movie);
	}
}
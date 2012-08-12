var imdbUrl = "http://www.imdb.com";

function removeMetaHtmlAttrs(node, what) {
	what = [ "id", "itemprop", "itemscope", "itemtype", "onclick" ];
	for (i in what) {
		node.find("*").removeAttr(what[i]);
	}
}

function extractDataFromMoviePage(contentNode, movieid) {
	contentNode = contentNode.children(":first").children(":first").children(":first");
	if (contentNode.length == 0) {
		return $("<p>Can't extract data - looks like IMDB layout problem :(</p>");
	}
	contentNode.find("#img_primary").remove();
	contentNode.find("#share-checkin").remove();
	contentNode.find("#share-popover").remove();
	contentNode.find("#prometer_container").remove();
	contentNode.find("#overview-bottom").remove();
	contentNode.find("img").remove();
	contentNode.find(".rightcornerlink").remove();
	contentNode.find(".star-box-rating-widget").remove();
	contentNode.find(".star-box-giga-star").remove();
	contentNode.find("clear").remove();
	contentNode.find("p:empty").remove();

	contentNode.find("h4").each(function(index) {
		$(this).replaceWith($("<strong>" + $(this).text() + "</strong>"));
	});
	contentNode.find("h1").each(function(index) {
		$(this).replaceWith($("<h3><a href='"+movieid+"'> " + $(this).text() + "</a><h3>"));
	});
	removeMetaHtmlAttrs(contentNode);
	makeHrefAbsolute(imdbUrl, contentNode);
	htmlstring = removeNewLines(contentNode.html());
	contentNode = $(htmlstring);
	return contentNode;
}

function extractPossibleData(data) {
	nodeHtml = "<td>";
	mainNode = $(data).find("#main");
	mainNode.find(".show-hide").remove();
	mainNode.find("table").each(function(index) {
		titleTitle = $(this).prev().text().trim();
		if (titleTitle.length > 0) {
			titleTitle = removeOnlyBrackets(titleTitle);
			titleTitle = titleTitle.replace(/titles/gi, "");
			titleTitle = titleTitle.trim();

			wrongSections = [ "Keywords Approx Matches", "Companies Approx Matches", "Names Approx Matches" ];
			if (containsAny(titleTitle, wrongSections)) {
				return;
			}

			nodeHtml = nodeHtml + "<div><h3>" + titleTitle + "</h3><ul>";

			d1 = $(this).find("a[href^='/title/tt']").parent().slice(0, 10);
			d1.find("a").removeAttr("onclick");
			d1.find("br").remove();
			d1.find("img").remove();
			d1.find("a:empty").remove();
			d1.find("a").each(function(index) {
				year = $(this).parent().contents().filter(function() {
					return this.nodeType == Node.TEXT_NODE;
				}).text();

				$(this).parent().contents().filter(function() {
					return this.nodeType == Node.TEXT_NODE;
				}).remove();

				$(this).replaceWith("<li><strong><a href=\"" + this.href + "\">" + $(this).text() + "</a></strong>" + year + "</li/>");

			});
			d1.find("p").each(function(index) {
				$(this).replaceWith("<div>" + $(this).text() + "</div>");
			});

			total = 0;
			d1.each(function(index) {
				theHtml = $(this).html().trim();
				if (theHtml.length > 0 && theHtml != '&nbsp;') {
					total++;
					if (total > 2) {
						return;
					}
					nodeHtml = nodeHtml + theHtml;
				}
			});
			nodeHtml = nodeHtml + "<ul></div>";
		}
	});
	nodeHtml = nodeHtml + "</td>";
	if (nodeHtml.length < 50) {
		nodeHtml = "";
	}
	contentNode = $(nodeHtml);
	makeHrefAbsolute(imdbUrl, contentNode);
	return contentNode;
}

function callImdbForMovie(opts, _movieNode, _movie, _movieId) {

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
			contentNode = $(data).find("#maindetails_center_top").find("#title-overview-widget");
			contentNode = extractDataFromMoviePage(contentNode, movieId);
			imdbCache.addMovie(Movie, contentNode.html());
			updateMovieSection(opts, movieNode, contentNode, null);
		},
		failure : function(data) {
			replaceWith(filmwebNode, "Can't connect to IMDB");
		}
	};

	if (opts.Integration.Download_one_movie_descryption_at_a_time) {
		$.ajaxq("imdbQueueForMovie", callOpts);
	} else {
		$.ajax(callOpts);
	}

}

function callImdbForAnything(opts, _movieNode, _movie) {
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
			contentNode = $(data).find("#maindetails_center_top").find("#title-overview-widget");
			if (contentNode.length > 0) {
				contentNode = extractDataFromMoviePage(contentNode);
			} else {
				contentNode = extractPossibleData(data);
			}
			imdbCache.addMovie(Movie, contentNode.html());
			updateMovieSection(opts, movieNode, contentNode, Movie);
		},
		failure : function(data) {
			replaceWith(filmwebNode, "Can't connect to IMDB");
		}
	};

	if (opts.Integration.Download_one_movie_descryption_at_a_time) {
		$.ajaxq("imdbQueueForAnything", callOpts);
	} else {
		$.ajax(callOpts);
	}
}

function callImdb(opts, _movieNode, _movie) {

	var movieNode = _movieNode;
	var Movie = _movie;

	cachedContentNode = imdbCache.getFromCache(Movie);
	if (cachedContentNode != undefined) {
		updateMovieSection(opts, movieNode, $("<div></div>").append(cachedContentNode), Movie);
	} else {

		params = {
			title : Movie.title,
			title_type : "feature,tv_movie"
		};

		var theUrl = imdbUrl + "/search/title?" + $.param(params);

		callOpts = {
			url : theUrl,
			beforeSend : function(xhr) {
				console.log("[IMDB] Call to get (callImdb) " + JSON.stringify(Movie) + " with url=" + theUrl);
			},
			success : function(data) {
				content = $(data).find("#main").find("table").find(".title");
				if (content.length == 0) {
					callImdbForAnything(opts, _movieNode, _movie);
				} else {

					movieId = null;
					content.each(function(index) {
						linkNode = $(this).find("a[href^='/title/tt']");

						if (movieId == null) {
							movieId = linkNode.attr("href");
						}
						if (Movie.year != null) {
							yearNode = $(this).find(".year_type");
							year = removeOnlyBrackets(yearNode.text());
							if (year.indexOf(Movie.year) >= 0) {
								movieId = linkNode.attr("href");
							}
						}
					});

					callImdbForMovie(opts, movieNode, Movie, movieId);
				}
			},
			failure : function(data) {
				replaceWith(filmwebNode, "Can't connect to IMDB");
			}
		};

		if (opts.Integration.Download_one_movie_descryption_at_a_time) {
			$.ajaxq("imdbQueue", callOpts);
		} else {
			$.ajax(callOpts);
		}
	}
}
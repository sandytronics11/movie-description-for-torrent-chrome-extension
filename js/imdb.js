function removeMetaHtmlAttrs(node, what) {
	what = [ "class", "id", "itemprop", "itemscope", "itemtype", "onclick" ];
	for (i in what) {
		node.find("*").removeAttr(what[i]);
	}
}

function extractDataFromMoviePage(contentNode) {
	contentNode = contentNode.children(":first").children(":first").children(":first");
	contentNode.find("#img_primary").remove();
	contentNode.find("#share-checkin").remove();
	contentNode.find("#share-popover").remove();
	contentNode.find("#prometer_container").remove();
	contentNode.find("#overview-bottom").remove();
	contentNode.find("img").remove();
	contentNode.find(".star-box-rating-widget").remove();
	contentNode.find("h4").each(function(index) {
		$(this).replaceWith($("<strong>" + $(this).text() + "</strong>"));
	});
	contentNode.find("h1").each(function(index) {
		$(this).replaceWith($("<h3>" + $(this).text() + "<h3>"));
	});
	removeMetaHtmlAttrs(contentNode);
	makeHrefAbsolute("http://www.imdb.com", contentNode);
	htmlstring = removeNewLines(contentNode.html());
	contentNode = $(htmlstring);
	return contentNode;
}

function extractPossibleData(data) {
	nodeHtml = "<td>";
	mainNode = $(data).find("#main");
	mainNode.find(".show-hide").remove();
	mainNode.find("table").each(function(index) {
		prev = $(this).prev();
		if (prev.text().trim().length > 0) {
			titleTitle = prev.text();
			titleTitle = titleTitle.replace(/titles/gi, "");
			titleTitle = titleTitle.replace(new RegExp("[\\(\\)]", "gi"), "");
			titleTitle = titleTitle.trim();

			if (titleTitle.indexOf("Keywords Approx Matches") >= 0) {
				return;
			}
			if (titleTitle.indexOf("Companies Approx Matches") >= 0) {
				return;
			}
			if (titleTitle.indexOf("Names Approx Matches") >= 0) {
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
	makeHrefAbsolute("http://www.imdb.com", contentNode);
	return contentNode;
}

function callImdbForMovie(opts, _movieNode, _theUrl) {

	var movieNode = _movieNode;
	var theUrl = _theUrl;

	callOpts = {
		url : theUrl,
		beforeSend : function(xhr) {
			console.log("[IMDB] Call to get (callImdbForMovie) movie with url=" + theUrl);
		},
		success : function(data) {
			contentNode = $(data).find("#maindetails_center_top").find("#title-overview-widget");
			contentNode = extractDataFromMoviePage(contentNode);
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

	var theUrl = "http://www.imdb.com/find?" + $.param(params);

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

	params = {
		title : Movie.title,
		title_type : "feature,tv_movie"
	};

	var theUrl = "http://www.imdb.com/search/title?" + $.param(params);

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

				movieUrl = null;
				content.each(function(index) {

					if (index > 0) {
						return;
					}
					if (Movie.year != null) {

					}
					yearNode = $(this).find(".year_type");
					linkNode = $(this).find("a[href^='/title/tt']");
					year = yearNode.text();
					movieUrl = "http://www.imdb.com" + linkNode.attr("href");
				});

				callImdbForMovie(opts, movieNode, movieUrl);
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
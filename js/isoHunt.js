var DELIMITER = "ISOHUNTTHEDELIMITERTHE";

function removeDelimiter(str) {
	return str.replace(new RegExp(DELIMITER, "gi"), "");
}

function getOriginalMovieTitle(htmlNode) {
	var res = "";

	htmlNode.contents().each(function(index, item) {
		nodeVal = $(this).text().trim();
		if (item.nodeName == "SPAN") {
			nodeVal = $(this).attr("title");
		}

		if (res == "") {
			res = res + nodeVal + DELIMITER + " ";
		} else {
			res = res + nodeVal + " ";
		}
	});

	return normalize(res);
}

function getCleanTitleIsohunt(movieTitle) {
	movieTitle = removeBrackets(movieTitle, true);

	what = [ "HD RIPS", "UCF.97", "x264", "dvdr", "xvid", "highres", "DVD", "DVD Rip", "DVD-R", "xxx", "porn", "bollywood", "animation", "Documentary",
			"Romance", "Biography", "Sports", "Fantasy", "comedy", "drama", "crime", "anime", "adventure", "Sci\\-Fi", "Tutorial", "Mystery", "Family",
			"Dance", "War", "western", "horror", "animation", "thriller", "westerns", "action", "pop" ];

	for (i in what) {
		movieTitle = movieTitle.replace(new RegExp("^" + what[i] + DELIMITER, "gi"), "");
	}

	movieTitle = normalize(removeDelimiter(movieTitle));

	console.log(" after removing isohunts prefixes '" + movieTitle + "'");

	return getCleanTitleGeneric(movieTitle);
}

function augmentIsoHunt(opts) {

	addEnableDisablePart(opts, '#serps');

	if (!opts.General.Integrate_with_IsoHunt) {
		return;
	}

	if (opts.General.Remove_adds_on_PirateBay_and_IsoHunt) {
		console.log("[MAIN] Removing adds");
		$(document).find("a[href^='http://isohunt.com/a/adclick.php']").remove();
		$(document).find("script").remove();
		$(document).find("noscript").remove();
		$(document).find("iframe").remove();
	}

	resultSet = $('#serps').find("tbody").children(":first");
	if (opts.Integration.Integrate_with_Filmweb) {
		resultSet.append("<th id='filmweb_th'>" + prepateURLToOptions("FilmWeb") + "</th>");
	}
	if (opts.Integration.Integrate_with_IMDB) {
		resultSet.append("<th id='imdb_th'>" + prepateURLToOptions("IMDB") + "</th>");
	}
	if (opts.Links.Add_links) {
		resultSet.append("<th id='links_th'>" + prepateURLToOptions("Links") + "</th>");
	}

	console.log("[MAIN] Begin of scanning");
	
	
	if (opts.General.Remove_adds_on_PirateBay_and_IsoHunt) {
		$('#serps').find("tbody").children().each(function(index) {
			$(this).removeAttr("onclick");
			$(this).removeAttr("onmouseover");
			$(this).removeAttr("onmouseout");
		});
	}
	
	$('#serps').find("tbody").children(" .hlRow").each(function(index) {

		if ($(this).find("th").length > 0) {
			return;
		}

		var filmwebNode = $("<td class=\"row3\" id=\"filmweb_" + index + "\">" + getAjaxIcon() + "</td>");
		var imdbNode = $("<td class=\"row3\" id=\"imdb_" + index + "\">" + getAjaxIcon() + "</td>");
		var linksNode = $("<td class=\"row3\" id=\"links_" + index + "\"></td>");
		if (opts.Integration.Integrate_with_Filmweb) {
			$(this).append(filmwebNode);
		}
		if (opts.Integration.Integrate_with_IMDB) {
			$(this).append(imdbNode);
		}
		if (opts.Links.Add_links) {
			$(this).append(linksNode);
		}

		torrentNameNode = $(this).children("td[id^='name']");
		if (torrentNameNode.length == 0) {
			console.log("[ERROR]: there is no torrent name node");
			return;
		}

		var originalTitle = getOriginalMovieTitle(torrentNameNode.children("a[id^='link']"));
		if (originalTitle == "") {
			originalTitle = torrentNameNode.children("a[id^='RL']").attr("title");
		}
		if (originalTitle == null || originalTitle == undefined || originalTitle == "") {
			console.log("[ERROR]: there is no torrent title");
			return;
		}
		console.log("-------");
		console.log("[MAIN] New title: '" + removeDelimiter(originalTitle) + "'");
		var cleanedTitle = getCleanTitleIsohunt(originalTitle);
		if (cleanedTitle == null) {
			console.log("[ERROR]: torrent title is empty");
			return;
		}

		if (opts.Links.Add_links) {
			if (opts.Links.Use_torrent_title_as_query_param) {
				linksNode.append(getLinksColumn(opts.Links, {
					title : removeDelimiter(originalTitle),
					year : null
				}));
			}
			if (opts.Links.Use_movie_title_as_query_param) {
				linksNode.append(getLinksColumn(opts.Links, cleanedTitle));
			}
		}

		if (opts.Integration.Integrate_with_Filmweb) {
			if (cleanedTitle.not_sure && filmwebCache.getFromCache(cleanedTitle) == undefined) {
				node = $("<p>Is '" + removeDelimiter(cleanedTitle.title) + "' a movie ?</p>");
				node.click(function() {
					replaceWith(filmwebNode, getAjaxIcon());
					callFilmweb(opts, filmwebNode, cleanedTitle);

				});
				replaceWith(filmwebNode, node);
			} else {
				callFilmweb(opts, filmwebNode, cleanedTitle);
			}
		}

		if (opts.Integration.Integrate_with_IMDB) {
			if (cleanedTitle.not_sure && imdbCache.getFromCache(cleanedTitle) == undefined) {
				node = $("<p>Is '" + removeDelimiter(cleanedTitle.title) + "' a movie ?</p>");
				node.click(function() {
					replaceWith(imdbNode, getAjaxIcon());
					callImdb(opts, imdbNode, cleanedTitle);
				});
				replaceWith(imdbNode, node);
			} else {
				callImdb(opts, imdbNode, cleanedTitle);
			}
		}

	});
	console.log("[MAIN] End of scanning");
}
DELIMITER = "ISOHUNTTHEDELIMITERTHE";

function removeDelimiter(str) {
	return str.replace(new RegExp(DELIMITER, "gi"), "");
}

function getOriginalMovieTitle(htmlNode) {
	var res = "";

	htmlNode.contents().each(function(index, item) {
		var nodeVal = $(this).text().trim();
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

function getCleanTitleIsohunt(_movieTitle) {
	var movieTitle = removeBrackets(_movieTitle, true);

	var what = [ "HD RIPS", "UCF.97", "x264", "dvdr", "xvid", "highres", "DVD", "DVD Rip", "DVD-R", "xxx", "porn", "bollywood", "animation",
			"Documentary", "Romance", "Biography", "Sports", "Fantasy", "comedy", "drama", "crime", "anime", "adventure", "Sci\\-Fi",
			"Tutorial", "Mystery", "Family", "Dance", "War", "western", "horror", "animation", "thriller", "westerns", "action", "pop" ];

	for (var i in what) {
		movieTitle = movieTitle.replace(new RegExp("^" + what[i] + DELIMITER, "gi"), "");
	}

	movieTitle = normalize(removeDelimiter(movieTitle));

	console.log(" after removing isohunts prefixes '" + movieTitle + "'");

	return getCleanTitleGeneric(movieTitle);
}

function augmentIsoHunt() {

	addEnableDisablePart('#serps');

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

	var resultSet = $('#serps').find("tbody").children(":first");
	if (opts.FilmWeb.Integrate_with_FilmWeb) {
		resultSet.append("<th>" + prepateURLToOptions("FilmWeb") + "</th>");
	}
	if (opts.IMDB.Integrate_with_IMDB) {
		resultSet.append("<th>" + prepateURLToOptions("IMDB") + "</th>");
	}
	if (opts.Links.Add_links) {
		resultSet.append("<th>" + prepateURLToOptions("Links") + "</th>");
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

		var filmwebNode = $("<td class=\"row3\" \">" + getAjaxIcon() + "</td>");
		var imdbNode = $("<td class=\"row3\" \">" + getAjaxIcon() + "</td>");
		var linksNode = $("<td class=\"row3\" \"></td>");
		if (opts.FilmWeb.Integrate_with_FilmWeb) {
			$(this).append(filmwebNode);
		}
		if (opts.IMDB.Integrate_with_IMDB) {
			$(this).append(imdbNode);
		}
		if (opts.Links.Add_links) {
			$(this).append(linksNode);
		}

		var torrentNameNode = $(this).children("td[id^='name']");
		if (torrentNameNode.length == 0) {
			console.log("There is no torrent name node");
			return;
		}

		var originalTitle = getOriginalMovieTitle(torrentNameNode.children("a[id^='link']"));
		if (originalTitle == "") {
			originalTitle = torrentNameNode.children("a[id^='RL']").attr("title");
		}
		if (originalTitle == null || originalTitle == undefined || originalTitle == "") {
			console.error("There is no torrent title");
			return;
		}
		console.log("-------");
		console.log("[MAIN] New title: '" + removeDelimiter(originalTitle) + "'");
		var cleanedTitle = getCleanTitleIsohunt(originalTitle);
		if (cleanedTitle == null) {
			console.error("Torrent title is empty");
			return;
		}

		if (opts.Links.Add_links) {
			if (opts.Links.Use_torrent_title_as_query_param) {
				linksNode.append(getLinksColumn({
					title : removeDelimiter(originalTitle),
					year : null
				}));
			}
			if (opts.Links.Use_movie_title_as_query_param) {
				linksNode.append(getLinksColumn(cleanedTitle));
			}
		}
		if (opts.FilmWeb.Integrate_with_FilmWeb) {
			callFilmwebImpl(filmwebNode, cleanedTitle);
		}
		if (opts.IMDB.Integrate_with_IMDB) {
			callIMDBImpl(imdbNode, cleanedTitle);
		}
	});
	console.log("[MAIN] End of scanning");
}
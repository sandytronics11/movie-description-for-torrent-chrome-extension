function augmentPirateBay() {

	addEnableDisablePart('#searchResult');

	if (opts.General.Remove_adds_on_PirateBay_and_IsoHunt) {
		console.log("[MAIN] Removing adds");
		$('iframe').remove();
	}
	var resultSet = $('#tableHead').children(":first");
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
	$('#searchResult').find("tbody").children().each(function(index) {

		var titleNode = $(this).find(" .detName");
		if (titleNode.length == 0) {
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

		var originalTitle = titleNode.children(":first").html();
		console.log("-------");
		console.log("[MAIN] New title: '" + originalTitle + "'");
		var cleanedTitle = getCleanTitleGeneric(originalTitle);
		if (cleanedTitle == null) {
			console.log("[ERROR]: torrent title is empty");
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
function augmentPirateBay(opts) {

	addEnableDisablePart(opts, '#searchResult', function(isSelected) {
		opts.General.Integrate_with_PirateBay = isSelected;
	}, opts.General.Integrate_with_PirateBay);

	if (!opts.General.Integrate_with_PirateBay) {
		return;
	}

	if (opts.General.Remove_adds_on_PirateBay_and_IsoHunt) {
		console.log("[MAIN] Removing adds");
		$('iframe').remove();
	}
	resultSet = $('#tableHead').children(":first");
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
	$('#searchResult').find("tbody").children().each(function(index) {

		titleNode = $(this).find(" .detName");
		if (titleNode.length == 0) {
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

		originalTitle = titleNode.children(":first").html();
		console.log("-------");
		console.log("[MAIN] New title: '" + originalTitle + "'");
		var cleanedTitle = getCleanTitleGeneric(originalTitle);
		if (cleanedTitle == null) {
			console.log("[ERROR]: torrent title is empty");
			return;
		}

		if (opts.Links.Add_links) {
			if (opts.Links.Use_original_title_as_query_param) {
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
			if (cleanedTitle.not_sure && getFromCache(cleanedTitle) == undefined) {
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
			if (cleanedTitle.not_sure && getFromCache(cleanedTitle) == undefined) {
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
function augmentPirateBay() {

	addEnableDisablePart('#searchResult');

	if (opts.General.Remove_adds_on_PirateBay_and_IsoHunt) {
		console.log("[MAIN] Removing adds");
		$('iframe').remove();
	}
	resultSet = $('#tableHead').children(":first");
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

		titleNode = $(this).find(" .detName");
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

		originalTitle = titleNode.children(":first").html();
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
			var callIMDBWhenNeeded = !opts.IMDB.Integrate_with_IMDB && opts.FilmWeb.Fallback_to_IMDB_when_cant_find_movie;

			if (cleanedTitle.not_sure && filmwebCache.getFromCache(cleanedTitle) == undefined) {
				node = $("<p>Is '" + removeDelimiter(cleanedTitle.title) + "' a movie ?</p>");
				node.click(function() {
					replaceWith(filmwebNode, getAjaxIcon());
					callFilmweb(filmwebNode, cleanedTitle, function(found) {
						if (callIMDBWhenNeeded && !found) {
							// TODO:
						}
					});

				});
				replaceWith(filmwebNode, node);
			} else {
				callFilmweb(filmwebNode, cleanedTitle, function(found) {
					if (callIMDBWhenNeeded && !found) {
						// TODO:
					}
				});
			}
		}

		if (opts.IMDB.Integrate_with_IMDB) {
			if (cleanedTitle.not_sure && imdbCache.getFromCache(cleanedTitle) == undefined) {
				node = $("<p>Is '" + removeDelimiter(cleanedTitle.title) + "' a movie ?</p>");
				node.click(function() {
					replaceWith(imdbNode, getAjaxIcon());
					callImdb(imdbNode, cleanedTitle);
				});
				replaceWith(imdbNode, node);
			} else {
				callImdb(imdbNode, cleanedTitle);
			}
		}
	});
	console.log("[MAIN] End of scanning");
}
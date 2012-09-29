"use strict";

function augmentPirateBay() {
	var opts = myOPT.opts;

	if (!opts.General.Integrate_with_PirateBay) {
		console.log("PirateBay is selected not to be integrated, skipping");
		return;
	}

	createOptionsBreadcrumbsNode().insertBefore('#searchResult');

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

		var titleNode = $(this).find(".detName");
		if (titleNode.length == 0) {
			// it could be 'single' mode
			titleNode = $(this).find(".vertTh").next();
			if (titleNode.length == 0) {
				return;
			}
		}

		var originalTitle = titleNode.children(":first").html();
		console.log("-------");
		console.log("[MAIN] New title: '" + originalTitle + "'");
		var cleanedTitle = getCleanTitleGeneric(originalTitle);
		if (cleanedTitle == null) {
			console.error("Torrent title is empty - looks like layout problem");
			return;
		}

		if (isMovieAlreadyBlacklisted(cleanedTitle)) {
			console.log("movie '" + cleanedTitle.title + "' is blacklisted");
			$(this).hide(500);
			return;
		}
		if (opts.FilmWeb.Integrate_with_FilmWeb) {
			var filmwebNode = $("<td>" + getAjaxIcon() + "</td>");
			$(this).append(filmwebNode);
			addFilmwebCell(filmwebNode, cleanedTitle);
		}
		if (opts.IMDB.Integrate_with_IMDB) {
			var imdbNode = $("<td>" + getAjaxIcon() + "</td>");
			$(this).append(imdbNode);
			addIMDBCell(imdbNode, cleanedTitle);
		}
		if (opts.Links.Add_links) {
			var linksNode = $("<td></td>");
			$(this).append(linksNode);
			addLinksCell(linksNode, originalTitle, cleanedTitle);
		}
	});
	console.log("[MAIN] End of scanning");
}
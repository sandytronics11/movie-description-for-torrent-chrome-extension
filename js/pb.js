var storage = chrome.storage.local;

var DELIMITER = "THEDELIMITERTHE";

function removeDelimiter(title) {
	return title.replace(new RegExp(DELIMITER, "gi"), "");
}

function getMovieTitleFromIsoHuntResultRow(htmlNode) {
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

	return res.trim();
}

function addEnableDisablePart(opts, anchor, callback, isSelectedNow) {
	switchNode = $("<div><input name='enabletorrplugin' type='checkbox'>Enable Torrent With Filmweb Chrome Extension</input>"
			+ prepateURLToOptions(" [More...]") + "</div>");
	switchNode.insertBefore(anchor);

	chbNode = switchNode.find("input[name='enabletorrplugin']");
	chbNode.click(function() {
		isSelected = $(this).is(':checked');
		callback(isSelected);
		updateOptions(opts);
		window.location.reload();
	});
	chbNode.attr('checked', isSelectedNow);

}

function getTheFilmsFromIsoHunt(opts) {

	addEnableDisablePart(opts, '#serps', function(isSelected) {
		opts.General.Integrate_with_IsoHunt = isSelected;
	}, opts.General.Integrate_with_IsoHunt);

	if (!opts.General.Integrate_with_IsoHunt) {
		return;
	}

	if (opts.General.Remove_adds_on_PirateBay_and_IsoHunt) {
		console.log("removing adds");

		$(document).find("a[href^='http://isohunt.com/a/adclick.php']").remove();
		$(document).find("script").remove();
		$(document).find("noscript").remove();
		$(document).find("iframe").remove();
	}

	resultSet = $('#serps').find("tbody").children(":first");
	if (opts.Filmweb_Integration_Options.Integrate_with_Filmweb) {
		resultSet.append("<th id='filmweb_th'>" + prepateURLToOptions("Filmweb") + "</th>");
	}
	if (opts.Links.Add_links) {
		resultSet.append("<th id='links_th'>" + prepateURLToOptions("Links") + "</th>");
	}

	$('#serps').find("tbody").children(" .hlRow").each(function(index) {

		if ($(this).find("th").length > 0) {
			return;
		}

		if (opts.General.Remove_adds_on_PirateBay_and_IsoHunt) {
			$(this).removeAttr("onclick");
		}

		var filmwebNode = $("<td class=\"row3\" id=\"filmweb_" + index + "\">" + getAjaxIcon() + "</td>");
		var linksNode = $("<td class=\"row3\" id=\"links_" + index + "\"></td>");

		if (opts.Filmweb_Integration_Options.Integrate_with_Filmweb) {
			$(this).append(filmwebNode);
		}
		if (opts.Links.Add_links) {
			$(this).append(linksNode);
		}

		torrentNameNode = $(this).children("td[id^='name']");
		if (torrentNameNode.length == 0) {
			console.log("unexpected: there is no torrentNameNode ?");
			return;
		}

		originalTitle = getMovieTitleFromIsoHuntResultRow(torrentNameNode.children("a[id^='link']"));
		if (originalTitle == "") {
			originalTitle = torrentNameNode.children("a[id^='RL']").attr("title");
		}
		if (originalTitle == null || originalTitle == undefined || originalTitle == "") {
			console.log("unexpected: there is no torrentTitle ?");
			return;
		}

		console.log("NEW title: '" + removeDelimiter(originalTitle) + "'");
		var cleanedTitle = getCleanTitleIsohunt(originalTitle);

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

		if (opts.Filmweb_Integration_Options.Integrate_with_Filmweb) {
			if (cleanedTitle.not_sure) {
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

	});
}

function prepateURLToOptions(title) {
	hrefToOptions = chrome.extension.getURL("options.html");
	return "<a href=\"" + hrefToOptions + "\" target=_blank>" + title + "</a>";
}

function getTheFilmsFromPirate(opts) {

	addEnableDisablePart(opts, '#searchResult', function(isSelected) {
		opts.General.Integrate_with_PirateBay = isSelected;
	}, opts.General.Integrate_with_PirateBay);

	if (!opts.General.Integrate_with_PirateBay) {
		return;
	}

	if (opts.General.Remove_adds_on_PirateBay_and_IsoHunt) {
		console.log("removing adds");
		$('iframe').remove();
	}
	resultSet = $('#tableHead').children(":first");
	if (opts.Filmweb_Integration_Options.Integrate_with_Filmweb) {
		resultSet.append("<th id='filmweb_th'>" + prepateURLToOptions("Filmweb") + "</th>");
	}
	if (opts.Links.Add_links) {
		resultSet.append("<th id='links_th'>" + prepateURLToOptions("Links") + "</th>");
	}

	$('#searchResult').find("tbody").children().each(function(index) {

		titleNode = $(this).find(" .detName");
		if (titleNode.length == 0) {
			return;
		}

		var filmwebNode = $("<td id=\"filmweb_" + index + "\">" + getAjaxIcon() + "</td>");
		var linksNode = $("<td id=\"links_" + index + "\"></td>");

		if (opts.Filmweb_Integration_Options.Integrate_with_Filmweb) {
			$(this).append(filmwebNode);
		}
		if (opts.Links.Add_links) {
			$(this).append(linksNode);
		}

		originalTitle = titleNode.children(":first").html();
		console.log("NEW title: '" + originalTitle + "'");
		var cleanedTitle = getCleanTitlePirateBay(originalTitle);

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

		if (opts.Filmweb_Integration_Options.Integrate_with_Filmweb) {
			if (cleanedTitle.not_sure == true) {
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

	});
}

function isPirateBay() {
	return window.location.hostname.indexOf("pirate") >= 0;
}

$(document).ready(function() {

	storage.get('opts', function(result) {
		if (result.opts == undefined) {
			result.opts = getDefaultOptions();
		}
		if (result.opts.General.Enable_this_plugin) {
			if (isPirateBay()) {
				getTheFilmsFromPirate(result.opts);
			} else {
				getTheFilmsFromIsoHunt(result.opts);
			}
		}
	});

});
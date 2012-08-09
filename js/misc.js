function replaceWith(node, str) {
	node.empty().append(str);
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

function prepateURLToOptions(title) {
	href = chrome.extension.getURL("options.html");
	return "<a href=\"" + href + "\" target=_blank>" + title + "</a>";
}

function getAjaxIcon() {
	imgUrl = chrome.extension.getURL("ajax_loading_small.gif");
	return "<img src=\"" + imgUrl + "\" /></td>";
}

function removeDoubleWhitespaces(str) {
	return str.replace(/ +(?= )/g, '');
}

function normalize(str) {
	return removeDoubleWhitespaces(str).trim();
}

function removeBrackets(str, leadingOnly) {
	brackets = [ "\\[.+?\\]", "\\(.+?\\)", "\\{.+?\\}", "\\*\\*.+?\\*\\*" ];
	for (i in brackets) {
		regexpr = null;
		if (leadingOnly) {
			regexpr = new RegExp("^" + brackets[i], "gi");
		} else {
			regexpr = new RegExp(brackets[i], "gi");
		}
		str = str.replace(regexpr, "");
	}
	return str.trim();
}

function getFirstYear(str) {
	tmp = str.match(new RegExp("[1-2][0-9][0-9][0-9]", "gi"));
	if (tmp != null && tmp.length > 0) {
		return tmp[0];
	}
	return null;
}

function getCleanTitleGeneric(originalTitle) {

	movieYear = null;
	possibleMovieTitle = false;
	filmNameClean = removeBrackets(originalTitle, true);
	year = filmNameClean.match(new RegExp("[\\(\\[\\ \\.\\*\\-\\{\\_][1-2][0-9][0-9][0-9]([\\)\\]\\ \\.\\,\\*\\}\\[\\-\\_\\(]|$)", "gi"));
	if (year != null && year.length > 0) {
		movieYear = getFirstYear(year[0]);
		i = filmNameClean.indexOf(year[0]);
		console.log(" found year of the movie " + movieYear);
		filmNameClean = filmNameClean.substring(0, i);
		possibleMovieTitle = true;
	}

	filmNameClean = normalize(filmNameClean);
	console.log(" after removing everything until first date '" + filmNameClean + "'");

	filmNameClean = removeBrackets(filmNameClean, false);

	console.log(" after removing everything inside brackets '" + filmNameClean + "'");
	//
	special = filmNameClean
			.match(new RegExp("\\.mpg|\\.avi|TOPSIDER|KLAXXON|LIMITED|HDTV|SWEDISH|SWESUB|BDRIP|DVD|AC3|UNRATED|720p", "gi"));
	if (special != null && special.length > 0) {
		i = filmNameClean.indexOf(special[0]);
		filmNameClean = filmNameClean.substring(0, i);
		possibleMovieTitle = true;
	}
	filmNameClean = normalize(filmNameClean);
	console.log(" after choping off special endings '" + filmNameClean + "'");
	//
	filmNameClean = filmNameClean.replace(new RegExp("[\\[\\]\\(\\)\\.\\-\\=\\_]", "gi"), " ");
	filmNameClean = normalize(filmNameClean);
	console.log(" after cleaning nonalphanumeric characters '" + filmNameClean + "'");
	filmNameClean = normalize(filmNameClean);

	if (!possibleMovieTitle) {
		console.log("don't know if is a movie");
		return {
			not_sure : true,
			year : movieYear,
			title : filmNameClean
		};
	}

	ttr = [ "XDM", "AAC", "HD", "CAM", "DVDScrRip", "Dvdscr", "Rip", "1CD", "2CD", "MP3", "x264 5.1", "x264", "dvd5", "DVDRip", "RRG",
			"Xvid", "ICTV", "NL subs", "IPS", "Rel -", "\\*", "720p", "Hindi", "-", "BRRip", "\\(Rel \\)", "\\( Rel \\)", "\\( \\)",
			"\\(\\)" ];
	for (i in ttr) {
		filmNameClean = filmNameClean.replace(new RegExp(ttr[i], "gi"), "");
	}

	filmNameClean = normalize(filmNameClean);

	console.log(" final after removing buzzwords '" + filmNameClean+"'");

	if (filmNameClean == "") {
		return null;
	}

	return {
		year : movieYear,
		title : filmNameClean
	};
}

function getLinksColumn(optLiks, param) {

	node = $("<p></p>");
	if (optLiks.Add_Google_Search_link) {
		node.append("<a href='https://www.google.pl/search?" + $.param({
			q : param.title
		}) + "' target='_blank'>[search]</a>");
		node.append("<br/>");
	}
	if (optLiks.Add_Google_Graphic_link) {
		node.append("<a href='https://www.google.pl/search?" + $.param({
			safe : "off",
			q : param.title,
			tbm : "isch"
		}) + "' target='_blank'>[pics]</a>");
		node.append("<br/>");
	}
	if (optLiks.Add_Filmweb_link) {
		node.append("<a href='http://www.filmweb.pl/search?" + $.param({
			q : param.title
		}) + "' target='_blank'>[filmweb]</a>");
		node.append("<br/>");
	}
	if (optLiks.Add_IMDB_link) {
		yearInfo = "";
		if (param.year != null) {
			yearInfo = " (" + param.year + ")";
		}
		node.append("<a href='http://www.imdb.com/find?" + $.param({
			q : param.title + yearInfo
		}) + "&s=tt' target='_blank'>[imdb]</a>");
		node.append("<br/>");
	}
	return node;
}

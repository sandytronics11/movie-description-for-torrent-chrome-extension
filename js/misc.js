function replaceWith(node, str) {
	node.empty().append(str);
}

function removeOnlyBrackets(str) {
	return str.replace(new RegExp("[\\(\\)]", "gi"), "");
}

function containsAny(str, patterns) {
	for (i in patterns) {
		if (str.indexOf(patterns[i]) >= 0) {
			return true;
		}
	}
	return false;
}

function removeNewLines(str) {
	return str.replace(/(\r\n|\n|\r)/gm, "");
}

function makeHrefAbsolute(prefix, contentNode) {
	contentNode.find("a[href]").each(function() {
		i = this.href.indexOf("/");
		i = this.href.indexOf("/", i + 1);
		i = this.href.indexOf("/", i + 1);
		this.href = prefix + this.href.substring(i);
	});
}

function getRatingFromFilmWeb(contentNode) {
	rating = null;
	try {
		rating = contentNode.find(" .searchResultRating").contents()[0].wholeText.replace("/\\,/gi", ".");
		rating = parseFloat(rating);
	} catch (err) {
		console.log("[WARN]: while extracting filmweb rating: " + err);
	}
	return rating;
}

function getRatingFromIMDB(contentNode) {
	rating = null;
	try {
		rating = contentNode.find(" .star-box-details").children(":first").text();
		rating = parseFloat(rating);
	} catch (err) {
		console.log("[WARN]: while extracting imdb rating: " + err);
	}
	return rating;
}

function updateMovieSection(opts, movieNode, contentNode, movie) {
	if (contentNode.length == 0) {
		if (movie.year != undefined && movie.year != null) {
			replaceWith(movieNode, "Can't find '" + movie.title + "' of year " + movie.year + ".");
		} else {
			replaceWith(movieNode, "Can't find '" + movie.title + "'.");
		}
	} else {
		replaceWith(movieNode, contentNode);

		rating = getRatingFromFilmWeb(contentNode);
		if (rating == null) {
			rating = getRatingFromIMDB(contentNode);
		}

		if (rating >= parseFloat(opts.Integration.Mark_movies_with_rating_greater_or_equal_than)) {
			movieNode.css('background-color', '#FFFFAA');
		}

	}
}

function createCheckbox(id, desc) {
	return "<input name='" + id + "' type='checkbox'>" + desc + "</input>";
}

function addEnableDisablePart(opts, anchor) {
	switchNode = $("<div>" + createCheckbox('enable_filmweb_wito', 'Filmweb') + createCheckbox('enable_imdb_wito', 'Imdb')
			+ createCheckbox('enable_links_wito', 'Links') + prepateURLToOptions("  [More...]") + "</div>");
	switchNode.insertBefore(anchor);

	chbNode = switchNode.find("input[name='enable_filmweb_wito']");
	chbNode.click(function() {
		opts.Integration.Integrate_with_Filmweb = $(this).is(':checked');
		updateOptions(opts);
		window.location.reload();
	});
	chbNode.attr('checked', opts.Integration.Integrate_with_Filmweb);

	chbNode = switchNode.find("input[name='enable_imdb_wito']");
	chbNode.click(function() {
		opts.Integration.Integrate_with_IMDB = $(this).is(':checked');
		updateOptions(opts);
		window.location.reload();
	});
	chbNode.attr('checked', opts.Integration.Integrate_with_IMDB);

	chbNode = switchNode.find("input[name='enable_links_wito']");
	chbNode.click(function() {
		opts.Links.Add_links = $(this).is(':checked');
		updateOptions(opts);
		window.location.reload();
	});
	chbNode.attr('checked', opts.Links.Add_links);

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

	console.log(" final after removing buzzwords '" + filmNameClean + "'");

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

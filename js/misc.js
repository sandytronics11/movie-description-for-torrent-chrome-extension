function callAjax(qname, callOpts) {
	if (opts.Integration.Download_one_movie_descryption_at_a_time) {
		$.ajaxq(qname, callOpts);
	} else {
		$.ajax(callOpts);
	}
}

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

function updateMovieSection(movieNode, content, movie, rating, intOpts) {
	if (content == null) {
		if (movie.year != undefined && movie.year != null) {
			replaceWith(movieNode, "Can't find '" + movie.title + "' of year " + movie.year + ".");
		} else {
			replaceWith(movieNode, "Can't find '" + movie.title + "'.");
		}
	} else {
		replaceWith(movieNode, $("<div></div>").append(content));

		if (rating > 0) {

			if (rating <= parseFloat(intOpts.Hide_movies_with_rating_less_than)) {
				movieNode.parent().hide(2000);
			}
			if (rating >= parseFloat(intOpts.Mark_movies_with_rating_greater_or_equal_than)) {
				movieNode.css('background-color', '#FFFFAA');
			}
		}

	}
}

function createCheckbox(id, desc) {
	return "<input name='" + id + "' type='checkbox'>" + desc + "</input>";
}

function addEnableDisablePart(anchor) {
	var switchNode = $("<div></div>");
	switchNode.append(createCheckbox('enable_filmweb_chb', 'Filmweb'));
	switchNode.append(createCheckbox('enable_imdb_chb', 'Imdb'));
	switchNode.append(createCheckbox('enable_links_chb', 'Links'));
	switchNode.append(prepateURLToOptions("  [More...]"));

	switchNode.insertBefore(anchor);

	var chbNode = switchNode.find("input[name='enable_filmweb_chb']");
	chbNode.click(function() {
		opts.FilmWeb.Integrate_with_FilmWeb = $(this).is(':checked');
		updateOptions();
		window.location.reload();
	});
	chbNode.attr('checked', opts.FilmWeb.Integrate_with_FilmWeb);

	chbNode = switchNode.find("input[name='enable_imdb_chb']");
	chbNode.click(function() {
		opts.IMDB.Integrate_with_IMDB = $(this).is(':checked');
		updateOptions();
		window.location.reload();
	});
	chbNode.attr('checked', opts.IMDB.Integrate_with_IMDB);

	chbNode = switchNode.find("input[name='enable_links_chb']");
	chbNode.click(function() {
		opts.Links.Add_links = $(this).is(':checked');
		updateOptions();
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

function getLinksColumn(param) {

	node = $("<p></p>");
	if (opts.Links.Add_Google_Search_link) {
		node.append("<a href='https://www.google.pl/search?" + $.param({
			q : param.title
		}) + "' target='_blank'>[search]</a>");
		node.append("<br/>");
	}
	if (opts.Links.Add_Google_Graphic_link) {
		node.append("<a href='https://www.google.pl/search?" + $.param({
			safe : "off",
			q : param.title,
			tbm : "isch"
		}) + "' target='_blank'>[pics]</a>");
		node.append("<br/>");
	}
	if (opts.Links.Add_Filmweb_link) {
		node.append("<a href='http://www.filmweb.pl/search?" + $.param({
			q : param.title
		}) + "' target='_blank'>[filmweb]</a>");
		node.append("<br/>");
	}
	if (opts.Links.Add_IMDB_link) {
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

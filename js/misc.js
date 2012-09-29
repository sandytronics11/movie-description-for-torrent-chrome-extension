"use strict";

function isMovieAlreadyBlacklisted(cleanedTitle) {
	var tk = cleanedTitle.title;
	if (cleanedTitle.year != null) {
		tk = tk + " (" + cleanedTitle.year + ")";
	}
	return myBL.isBlacklisted(tk) || myWW.isBlacklisted(tk);
}

function addLinksCell(htmlNode, originalTitle, cleanedTitle) {
	var anyColumnAdded = false;
	if (myOPT.opts.Links.Use_torrent_title_as_query_param) {
		htmlNode.append(getLinksColumn({
			title : removeDelimiter(originalTitle),
			year : null
		}));
		anyColumnAdded = true;
	}
	if (myOPT.opts.Links.Use_movie_title_as_query_param) {
		htmlNode.append(getLinksColumn(cleanedTitle));
		anyColumnAdded = true;
	}

	if (myOPT.opts.Links.Add_hide_movie_link) {
		var tk = cleanedTitle.title;
		if (cleanedTitle.year != null) {
			tk = tk + " (" + cleanedTitle.year + ")";
		}

		var watchedBtn = $("<strong><a href='javascript:void(0)'>[watched]</a></strong>");
		watchedBtn.click(function() {
			myBL.add(tk);
			htmlNode.parent().hide(500);
		});
		if (anyColumnAdded) {
			htmlNode.append("<br/>");
		}
		htmlNode.append(watchedBtn);

		htmlNode.append("&nbsp;/&nbsp;");
		var wwatchBtn = $("<strong><a href='javascript:void(0)'>[won't watch]</a></strong>");
		wwatchBtn.click(function() {
			myWW.add(tk);
			htmlNode.parent().hide(500);
		});
		htmlNode.append(wwatchBtn);

	}
}

function addFilmwebCell(htmlNode, cleanedTitle) {
	var callIMDBWhenNeeded = !myOPT.opts.IMDB.Integrate_with_IMDB && myOPT.opts.FilmWeb.Fallback_to_IMDB_when_cant_find_movie;
	if (cleanedTitle.not_sure && filmwebCache.getFromCache(cleanedTitle) == undefined) {
		var node = $("<p>Is '" + removeDelimiter(cleanedTitle.title) + "' a movie ?</p>");
		node.click(function() {
			replaceWith(htmlNode, getAjaxIcon());
			callFilmweb(htmlNode, cleanedTitle, function(found) {
				if (callIMDBWhenNeeded && !found) {
					addIMDBCell(htmlNode, cleanedTitle);
				}
			});

		});
		replaceWith(htmlNode, node);
	} else {
		callFilmweb(htmlNode, cleanedTitle, function(found) {
			if (callIMDBWhenNeeded && !found) {
				addIMDBCell(htmlNode, cleanedTitle);
			}
		});
	}
}

function addIMDBCell(htmlNode, cleanedTitle) {
	if (cleanedTitle.not_sure && imdbCache.getFromCache(cleanedTitle) == undefined) {
		var node = $("<p>Is '" + removeDelimiter(cleanedTitle.title) + "' a movie ?</p>");
		node.click(function() {
			replaceWith(htmlNode, getAjaxIcon());
			callImdb(htmlNode, cleanedTitle);
		});
		replaceWith(htmlNode, node);
	} else {
		callImdb(htmlNode, cleanedTitle);
	}
}

function callAjax(qname, callOpts) {
	if (myOPT.opts.Integration.Download_one_movie_descryption_at_a_time) {
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
	for ( var i in patterns) {
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
		var i = this.href.indexOf("/");
		i = this.href.indexOf("/", i + 1);
		i = this.href.indexOf("/", i + 1);
		this.href = prefix + this.href.substring(i);
	});
}

function htmlEscape(text) {
	return text.replace(/[<>\&\"\']/g, function(c) {
		return '&#' + c.charCodeAt(0) + ';';
	});
}

function updateMovieSection(movieNode, content, movie, rating, intOpts) {
	if (intOpts.Show_movie_rating_only) {
		if (content == null) {
			replaceWith(movieNode, "?");
		} else {
			if (rating > 0) {
				replaceWith(movieNode, $("<div></div>").append("<a title='" + htmlEscape($(content).text()) + "'>" + rating + "</a>"));
			} else {
				replaceWith(movieNode, "N/A");
			}
		}
	} else {
		if (content == null) {
			if (movie.year != undefined && movie.year != null) {
				replaceWith(movieNode, "Can't find '" + movie.title + "' of year " + movie.year + ".");
			} else {
				replaceWith(movieNode, "Can't find '" + movie.title + "'.");
			}
		} else {
			replaceWith(movieNode, $("<div></div>").append(content));
		}
	}

	if (rating > 0) {
		if (rating <= parseFloat(intOpts.Hide_movies_with_rating_less_than)) {
			movieNode.parent().hide(500);
		}
		if (rating >= parseFloat(intOpts.Mark_movies_with_rating_greater_or_equal_than)) {
			movieNode.css('background-color', '#FFFFAA');
		}
	}

}

function createCheckboxOption(optionName, optionDescr, opts) {
	var chcb = $("<input type='checkbox'>" + optionDescr + "</input>");
	chcb.click(function() {
		opts[optionName] = $(this).is(':checked');
		myOPT.save();
		window.location.reload();
	});
	chcb.attr('checked', opts[optionName]);
	return chcb;
}

function createOptionsBreadcrumbsNode() {
	var optionNode = $("<div></div>");
	optionNode.append(createCheckboxOption("Integrate_with_FilmWeb", "Filmweb", myOPT.opts.FilmWeb));
	optionNode.append(createCheckboxOption("Integrate_with_IMDB", "IMDB", myOPT.opts.IMDB));
	optionNode.append(createCheckboxOption("Add_links", "Links", myOPT.opts.Links));
	optionNode.append(prepateURLToOptions("  [More...]"));
	return optionNode;
}

function prepateURLToOptions(title) {
	var href = chrome.extension.getURL("options.html");
	return "<a href=\"" + href + "\" target=_blank>" + title + "</a>";
}

function getAjaxIcon() {
	var imgUrl = chrome.extension.getURL("ajax_loading_small.gif");
	return "<img src=\"" + imgUrl + "\" /></td>";
}

function removeDoubleWhitespaces(str) {
	return str.replace(/ +(?= )/g, '');
}

function normalize(str) {
	return removeDoubleWhitespaces(str).trim();
}

function removeBrackets(str, leadingOnly) {
	var brackets = [ "\\[.+?\\]", "\\(.+?\\)", "\\{.+?\\}", "\\*\\*.+?\\*\\*" ];
	for ( var i in brackets) {
		var regexpr = null;
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
	var tmp = str.match(new RegExp("[1-2][0-9][0-9][0-9]", "gi"));
	if (tmp != null && tmp.length > 0) {
		return tmp[0];
	}
	return null;
}

function getCleanTitleGeneric(originalTitle) {

	var movieYear = null;
	var possibleMovieTitle = false;
	var filmNameClean = removeBrackets(originalTitle, true);
	var year = filmNameClean
			.match(new RegExp("[\\(\\[\\ \\.\\*\\-\\{\\_][1-2][0-9][0-9][0-9]([\\)\\]\\ \\.\\,\\*\\}\\[\\-\\_\\(]|$)", "gi"));
	if (year != null && year.length > 0) {
		movieYear = getFirstYear(year[0]);
		var i = filmNameClean.indexOf(year[0]);
		console.log(" found year of the movie " + movieYear);
		filmNameClean = filmNameClean.substring(0, i);
		possibleMovieTitle = true;
	}

	filmNameClean = normalize(filmNameClean);
	console.log(" after removing everything until first date '" + filmNameClean + "'");

	filmNameClean = removeBrackets(filmNameClean, false);

	console.log(" after removing everything inside brackets '" + filmNameClean + "'");
	//
	var special = filmNameClean.match(new RegExp("\\.mpg|\\.avi|TOPSIDER|KLAXXON|LIMITED|HDTV|SWEDISH|SWESUB|BDRIP|DVD|AC3|UNRATED|720p",
			"gi"));
	if (special != null && special.length > 0) {
		var i = filmNameClean.indexOf(special[0]);
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

	var ttr = [ "XDM", "AAC", "HD", "CAM", "DVDScrRip", "Dvdscr", "Rip", "1CD", "2CD", "MP3", "x264 5.1", "x264", "dvd5", "DVDRip", "RRG",
			"Xvid", "ICTV", "NL subs", "IPS", "Rel -", "\\*", "720p", "Hindi", "-", "BRRip", "\\(Rel \\)", "\\( Rel \\)", "\\( \\)",
			"\\(\\)" ];
	for ( var i in ttr) {
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

	var node = $("<p></p>");
	if (myOPT.opts.Links.Add_Google_Search_link) {
		node.append("<a href='https://www.google.pl/search?" + $.param({
			q : param.title
		}) + "' target='_blank'>[search]</a>");
		node.append("<br/>");
	}
	if (myOPT.opts.Links.Add_Google_Graphic_link) {
		node.append("<a href='https://www.google.pl/search?" + $.param({
			safe : "off",
			q : param.title,
			tbm : "isch"
		}) + "' target='_blank'>[pics]</a>");
		node.append("<br/>");
	}
	if (myOPT.opts.Links.Add_Filmweb_link) {
		node.append("<a href='http://www.filmweb.pl/search?" + $.param({
			q : param.title
		}) + "' target='_blank'>[filmweb]</a>");
		node.append("<br/>");
	}
	if (myOPT.opts.Links.Add_IMDB_link) {
		var yearInfo = "";
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

function replaceWith(node, str) {
	node.empty().append(str);
}

function getAjaxIcon() {
	imgUrl = chrome.extension.getURL("ajax_loading_small.gif");
	return "<img src=\"" + imgUrl + "\" /></td>";
}

function updateFilmwebSection(opts, filmwebNode, firstFilm, filmTitle) {
	if (firstFilm.length == 0) {
		replaceWith(filmwebNode, "Can't find '" + filmTitle + "'.");
	} else {
		firstFilm.find("a[href]").each(function() {
			i = this.href.indexOf("/");
			i = this.href.indexOf("/", i + 1);
			i = this.href.indexOf("/", i + 1);
			this.href = "http://www.filmweb.pl" + this.href.substring(i);
		});
		replaceWith(filmwebNode, firstFilm);

		try {
			rating = firstFilm.find(" .searchResultRating").contents()[0].wholeText.replace("/\\,/gi", ".");
			if (parseFloat(rating) >= parseFloat(opts.Filmweb_Integration_Options.Mark_movies_with_rating_greater_or_equal_than)) {
				filmwebNode.css('background-color', '#FFFFAA');
			}
		} catch (err) {
		}

	}
}

function callFilmweb(opts, _filmwebNode, _Movie) {

	var filmwebNode = _filmwebNode;
	var Movie = _Movie;

	console.log(" calling FilmWeb for '" + Movie.title + "'");

	firstFilm = getContentForMovie(Movie);
	if (firstFilm != undefined) {
		updateFilmwebSection(opts, filmwebNode, $(firstFilm));
	} else {

		callOpts = {
			url : "http://www.filmweb.pl/search?" + $.param({
				q : Movie.title
			}),
			success : function(data) {
				firstFilm = $(data).find("#searchFixCheck").children(":first").find(".searchResultCol_2_wrapper");
				if (firstFilm.length > 0) {
					addMovie(Movie, firstFilm.html());
				}
				updateFilmwebSection(opts, filmwebNode, firstFilm, Movie.title);

			},
			failure : function(data) {
				replaceWith(filmwebNode, "Can't connect to Filmweb");
			}
		};

		if (opts.Filmweb_Integration_Options.Download_one_movie_descryption_at_a_time) {
			$.ajaxq("filmWebQueue", callOpts);
		} else {
			$.ajax(callOpts);
		}
	}
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

function getCleanTitleIsohunt(movieTitle) {
	movieTitle = removeBrackets(movieTitle, true);

	what = [ "HD RIPS", "UCF.97", "x264", "dvdr", "xvid", "highres", "DVD Rip", "DVD-R", "xxx", "porn", "bollywood", "animation",
			"Documentary", "Romance", "Biography", "Sports", "Fantasy", "comedy", "drama", "crime", "anime", "adventure", "Sci\\-Fi",
			"Tutorial", "Mystery", "Family", "Dance", "War", "western", "horror", "animation", "thriller", "westerns", "action", "pop" ];

	for (i in what) {
		movieTitle = movieTitle.replace(new RegExp("^" + what[i] + DELIMITER, "gi"), "");
	}

	movieTitle = normalize(removeDelimiter(movieTitle));

	console.log(" after removing prefix '" + movieTitle + "'");

	return getCleanTitlePirateBay(movieTitle);
}

function getCleanTitlePirateBay(originalTitle) {

	movieYear = null;
	possibleMovieTitle = false;
	filmNameClean = removeBrackets(originalTitle, true);
	year = filmNameClean.match(new RegExp("[\\(\\[\\ \\.\\*\\-\\{\\_][1-2][0-9][0-9][0-9]([\\)\\]\\ \\.\\,\\*\\}\\[\\-\\_\\(]|$)", "gi"));
	if (year != null && year.length > 0) {
		movieYear = getFirstYear(year[0]);
		i = filmNameClean.indexOf(year[0]);
		console.log(" found year " + year[0] + " at pos " + i);
		filmNameClean = filmNameClean.substring(0, i);
		possibleMovieTitle = true;
	}

	filmNameClean = normalize(filmNameClean);
	console.log(" after removing everything until first date '" + filmNameClean + "'");

	filmNameClean = removeBrackets(filmNameClean, false);

	console.log(" after removing everything everything inside the brackets '" + filmNameClean + "'");
	//
	special = filmNameClean
			.match(new RegExp("\\.mpg|\\.avi|TOPSIDER|KLAXXON|LIMITED|HDTV|SWEDISH|SWESUB|BDRIP|DVD|AC3|UNRATED|720p", "gi"));
	if (special != null && special.length > 0) {
		i = filmNameClean.indexOf(special[0]);
		filmNameClean = filmNameClean.substring(0, i);
		possibleMovieTitle = true;
	}
	filmNameClean = normalize(filmNameClean);
	console.log(" after choping on special endings '" + filmNameClean + "'");
	//
	filmNameClean = filmNameClean.replace(new RegExp("[\\[\\]\\(\\)\\.\\-\\=\\_]", "gi"), " ");
	filmNameClean = normalize(filmNameClean);
	console.log(" after cleaning strange characters '" + filmNameClean + "'");
	filmNameClean = normalize(filmNameClean);

	if (!possibleMovieTitle) {
		console.log("==> don't know if is a movie");
		return {
			not_sure : true,
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

	console.log(" after removing buzzwords & trim '" + filmNameClean + "' of year " + movieYear);

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

function fixHrefsForFilmwebContent(contentNode) {
	contentNode.find("a[href]").each(function() {
		i = this.href.indexOf("/");
		i = this.href.indexOf("/", i + 1);
		i = this.href.indexOf("/", i + 1);
		this.href = "http://www.filmweb.pl" + this.href.substring(i);
	});
}

function updateFilmwebSection(opts, filmwebNode, contentNode, movie) {
	if (contentNode.length == 0) {
		if (movie.year != undefined && movie.year != null) {
			replaceWith(filmwebNode, "Can't find '" + movie.title + "' of year " + movie.year + ".");
		} else {
			replaceWith(filmwebNode, "Can't find '" + movie.title + "'.");
		}
	} else {
		replaceWith(filmwebNode, contentNode);

		try {
			rating = contentNode.find(" .searchResultRating").contents()[0].wholeText.replace("/\\,/gi", ".");
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

	cachedContentNode = getFromCache(Movie);
	if (cachedContentNode != undefined) {
		updateFilmwebSection(opts, filmwebNode, $("<div></div>").append(cachedContentNode), Movie);
	} else {

		params = {
			q : Movie.title
		};
		if (Movie.year != undefined && Movie.year != null) {
			params["startYear"] = Movie.year;
			params["endYear"] = Movie.year;
		}

		var fwUrl = "http://www.filmweb.pl/search/film?" + $.param(params);

		callOpts = {
			url : fwUrl,
			beforeSend : function(xhr) {
				console.log("[FilmWeb] Call to get " + JSON.stringify(Movie) + " with url=" + fwUrl);
			},
			success : function(data) {
				contentNode = $(data).find("#searchFixCheck").children(":first").find(".searchResultCol_2_wrapper");
				if (contentNode.length > 0) {
					console.log("[FilmWeb] Got data for " + JSON.stringify(Movie));
					fixHrefsForFilmwebContent(contentNode);
					addMovieToCache(Movie, contentNode.html());
				} else {
					console.log("[FilmWeb] There is no data for " + JSON.stringify(Movie));
				}
				updateFilmwebSection(opts, filmwebNode, contentNode, Movie);
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
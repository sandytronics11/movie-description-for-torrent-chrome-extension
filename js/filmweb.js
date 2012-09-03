filmwebUrl = "http://www.filmweb.pl";

function getRatingFromFilmWeb(contentNode) {
	var rating = null;
	try {
		rating = contentNode.find(".searchResultRating").contents()[0].wholeText;
		rating = rating.replace(new RegExp("\\,", "gi"), ".");
		rating = parseFloat(rating);
	} catch (err) {
		console.warn("Can't extract filmweb rating: " + err);
	}
	return rating;
}

function callFilmweb(_movieNode, _movie, callback) {

	var movieNode = _movieNode;
	var Movie = _movie;
	var cachedMovie = filmwebCache.getFromCache(Movie);
	if (cachedMovie != undefined) {
		updateMovieSection(movieNode, cachedMovie.content, Movie, cachedMovie.rating, opts.FilmWeb);
	} else {

		var params = {
			q : Movie.title
		};
		if (Movie.year != undefined && Movie.year != null) {
			params["startYear"] = Movie.year;
			params["endYear"] = Movie.year;
		}

		var theUrl = filmwebUrl + "/search/film?" + $.param(params);

		callAjax("filmWebQueue", {
			url : theUrl,
			beforeSend : function(xhr) {
				console.log("[FilmWeb] Call to get " + JSON.stringify(Movie) + " with url=" + theUrl);
			},
			success : function(data) {
				var contentNode = $(data).find("#searchFixCheck").children(":first").find(".searchResultCol_2_wrapper");

				if (!opts.Integration.Display_detailed_informations) {
					contentNode.find(".searchResultDetails").remove();
				}

				if (contentNode.length > 0) {
					makeHrefAbsolute(filmwebUrl, contentNode);
					var rating = getRatingFromFilmWeb(contentNode);
					contentNode.find("*").removeAttr("class");
					contentNode.find("span:empty").remove();
					filmwebCache.addMovie(Movie, contentNode.html(), rating);
					updateMovieSection(movieNode, contentNode.html(), Movie, rating, opts.FilmWeb);
					callback(true);
				} else {
					updateMovieSection(movieNode, null, Movie, null, opts.FilmWeb);
					callback(false);
				}

			},
			failure : function(data) {
				replaceWith(movieNode, "Can't connect to Filmweb");
			}
		});

	}
}
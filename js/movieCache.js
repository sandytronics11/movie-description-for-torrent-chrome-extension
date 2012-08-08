var movieCache = new Object();

function getMovieKey(Movie) {
	return Movie.title + "|" + Movie.year;
}

function addMovie(Movie, Content) {
	key = getMovieKey(Movie);
	ts = new Date().getTime();
	console.log("adding movie "+key+" to the cache with timestamp "+ts);
	movieCache[key] = {content : Content, timestamp : ts};
}

function isTsOlderThanNHours(timestamp, hours) {
	del = new Date().getTime() - timestamp;
	del = del / 1000; // secs
	del = del / 1000; // mins
	del = del / 1000; // hours
	return del > hours;
}

function removesMoviesOlderThan(hours) {
	console.log("evicting movies older than "+hours+" hours");
	for (var movieKey in movieCache) {
		if (isTsOlderThanNHours(movieCache[movieKey].timestamp, hours)) {
			console.log("evicting movie "+movieKey+" from the cache");
			delete movieCache[movieKey];
		}
	}
}

function getContentForMovie(Movie) {
	key = getMovieKey(Movie);
	cm = movieCache[key];
	if (cm == undefined) {
		return undefined;
	}
	if (isTsOlderThanNHours(cm.timestamp, 1)) {
		delete movieCache[key];
		return undefined;
	}
	console.log("[CACHE HIT] movie " + key+ " is valid in the cache - returning its content");
	return cm.content;
}
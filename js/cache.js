var storage = chrome.storage.local;
var movieCache = undefined;

function cleanCache() {
	storage.remove('movieCache');
}

function displayCache() {
	var done = false;
	storage.getBytesInUse('movieCache', function(result) {
		console.log("[CACHE] Cache size in use: " + Math.round(result / 1024) + "KB out of 5 MB");
		done = true;
	});
}

function reloadCache(callBack) {
	console.log("[CACHE] Loading cache");
	storage.get('movieCache', function(result) {
		if (result.movieCache != undefined) {
			console.log("[CACHE] Cache is not empty");
			movieCache = result.movieCache;
			displayCache();
		} else {
			movieCache = new Object();
			console.log("[CACHE] The cache is empty");
		}
		callBack();
	});
}

var saveCacheTimer = null;
var saveCacheLastTimestamp = null;
var quietPeriodMs = 500;

function saveCacheForReal() {
	console.log("[CACHE] Saving cache for real");
	storage.set({
		'movieCache' : movieCache
	});
}

function turnOnSaveCacheClock() {
	saveCacheLastTimestamp = new Date().getTime();
	saveCacheTimer = setTimeout(saveCacheForReal, quietPeriodMs);
}

function saveCache() {
	if (saveCacheLastTimestamp == null) {
		turnOnSaveCacheClock();
	} else {
		if (new Date().getTime() - saveCacheLastTimestamp < quietPeriodMs) {
			console.log("[CACHE] Not need to update cache yet");
			clearTimeout(saveCacheTimer);
		}
		turnOnSaveCacheClock();
	}
}

function getMovieKey(Movie) {
	return Movie.title + "|" + Movie.year;
}

function addMovieToCache(Movie, Content) {
	key = getMovieKey(Movie);
	ts = new Date().getTime();
	console.log("[CACHE] Adding movie " + key + " to the cache with timestamp " + ts);
	movieCache[key] = {
		content : Content,
		timestamp : ts
	};
	saveCache();
}

function isTsOlderThanNHours(timestamp, hours) {
	del = new Date().getTime() - timestamp;
	del = del / 1000; // secs
	del = del / 1000; // mins
	del = del / 1000; // hours
	return del > hours;
}

function removesMoviesOlderThan(hours) {
	console.log("[CACHE] Evicting movies from cache older than " + hours + " hours");
	for ( var movieKey in movieCache) {
		if (isTsOlderThanNHours(movieCache[movieKey].timestamp, hours)) {
			console.log("evicting movie " + movieKey + " from the cache");
			delete movieCache[movieKey];
		}
	}
}

function getFromCache(Movie) {
	key = getMovieKey(Movie);
	cm = movieCache[key];
	if (cm == undefined) {
		return undefined;
	}
	console.log("[CACHE] Cache hit for " + key);
	return cm.content;
}
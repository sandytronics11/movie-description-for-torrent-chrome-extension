function isPirateBay() {
	return window.location.hostname.indexOf("pirate") >= 0;
}

function reloadCacheAndDo(callback) {
	filmwebCache.reload(function() {
		imdbCache.reload(function() {
			filmwebCache.removesMoviesOlderThan(opts.FilmWeb.Expire_cache_after_hours);
			imdbCache.removesMoviesOlderThan(opts.IMDB.Expire_cache_after_hours);
			callback();

		});
	});
}

$(document).ready(function() {

	chrome.storage.local.get([ 'opts', 'mblacklist' ], function(result) {
		if (result.opts == undefined) {
			opts = getDefaultOptions();
		} else {
			opts = result.opts;
		}
		if (result.mblacklist == undefined) {
			mblacklist = getDefaultMblackList();
		} else {
			mblacklist = result.mblacklist;
		}
		if (opts.General.Enable_this_plugin) {
			console.log("opts = " + JSON.stringify(opts));
			console.log("mblacklist = " + JSON.stringify(mblacklist));
			reloadCacheAndDo(function() {
				if (isPirateBay()) {
					augmentPirateBay();
				} else {
					augmentIsoHunt();
				}
			});
		}
	});

});
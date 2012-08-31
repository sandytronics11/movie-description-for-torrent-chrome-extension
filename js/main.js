function isPirateBay() {
	return window.location.hostname.indexOf("pirate") >= 0;
}

function reloadCacheAndDo(callback) {
	filmwebCache.reload(function() {
		imdbCache.reload(function() {
			filmwebCache.removesMoviesOlderThan(opts.Integration.Expire_cache_after_hours);
			imdbCache.removesMoviesOlderThan(opts.Integration.Expire_cache_after_hours);
			callback();

		});
	});
}

$(document).ready(function() {

	chrome.storage.local.get('opts', function(result) {
		if (result.opts == undefined) {
			opts = getDefaultOptions();
		} else {
			opts = result.opts;
		}
		if (opts.General.Enable_this_plugin) {

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
function isPirateBay() {
	return window.location.hostname.indexOf("pirate") >= 0;
}

$(document).ready(function() {

	chrome.storage.local.get('opts', function(result) {
		if (result.opts == undefined) {
			result.opts = getDefaultOptions();
		}
		opts = result.opts;
		if (opts.General.Enable_this_plugin) {
			if (isPirateBay()) {
				filmwebCache.reload(function() {
					imdbCache.reload(function() {
						filmwebCache.removesMoviesOlderThan(opts.Integration.Expire_cache_after_hours);
						imdbCache.removesMoviesOlderThan(opts.Integration.Expire_cache_after_hours);
						augmentPirateBay(opts);
					});
				});
			} else {
				filmwebCache.reload(function() {
					imdbCache.reload(function() {
						filmwebCache.removesMoviesOlderThan(opts.Integration.Expire_cache_after_hours);
						imdbCache.removesMoviesOlderThan(opts.Integration.Expire_cache_after_hours);
						augmentIsoHunt(opts);
					});
				});
			}
		}
	});

});
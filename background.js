storage.get('opts', function(result) {
	if (result.opts == undefined) {
		result.opts = getDefaultOptions();
	}

	if (result.opts.General.Enable_this_plugin) {

		if (result.opts.General.Integrate_with_PirateBay) {

			chrome.webRequest.onBeforeRequest.addListener(function(info) {
				// alert("url1 intercepted: " + info.url);
				return {
					cancel : true
				};
			}, {

				urls : [ "http://clkads.com/*", "http://www.facebook.com/*", "http://player.vimeo.com/*", "http://www.888poker.com/*",
						"http://pl.888.com/*", "http://www.roulettebotplus.com/*" ]
			}, [ "blocking" ]);

		}

		if (result.opts.General.Integrate_with_IsoHunt) {
			chrome.webRequest.onBeforeRequest.addListener(function(info) {
				// alert("url2 intercepted: " + info.url);
				return {
					cancel : true
				};
			}, {
				urls : [ "http://altfarm.mediaplex.com/*", "http://optimized.by.vitalads.net/*", "http://ia.media-imdb.com/images/*",
						"http://isohunt.com/*.php*", "http://www.roulettebotplus.com/*", "http://pl.hornygirlsexposed.com/*",
						"http://survey-awardscenter.net/*", "http://7.rotator.wigetmedia.com/*", "http://www.wigetmedia.com/tags/isoww.js",
						"http://www.ad4game.com/*", "http://www.roulettebotplus.com/*", "http://geoadserve2.com/*",
						"http://**wigetmedia.com/*", "http://www.mgid.com/*", "http://ad.yieldmanager.com/*", "http://*.ad4game.com/*",
						
						"http://verified-p2p-links.com/*"]
			}, [ "blocking" ]);
		}
	}
});

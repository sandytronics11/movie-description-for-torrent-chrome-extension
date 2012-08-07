storage.get('opts', function(result) {
	if (result.opts==undefined) {
		result.opts = getDefaultOptions();
	}
	
	if (result.opts.General.Enable_this_plugin) {

	chrome.webRequest.onBeforeRequest.addListener(
	  function(info) {
//	    alert("url1 intercepted: " + info.url);
	    return {cancel: true};
	  },
	  {
	    urls: [
	      "http://clkads.com/*",
	      "http://player.vimeo.com/*"
	    ]
	  },
	  ["blocking"]);

	chrome.webRequest.onBeforeRequest.addListener(
	  function(info) {
//	    alert("url2 intercepted: " + info.url);
	    return {cancel: true};
	  },
	  {
	    urls: [
	      "http://isohunt.com/*.php*",
	      "http://www.roulettebotplus.com/*",
	      "http://pl.hornygirlsexposed.com/*",
	      "http://survey-awardscenter.net/*",
	      "http://7.rotator.wigetmedia.com/*"
	    ]
	  },
	  ["blocking"]);
	}
});




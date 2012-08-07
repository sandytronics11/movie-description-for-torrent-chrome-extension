chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    // alert("url intercepted: " + info.url);
    return {cancel: true};
  },
  {
    urls: [
      "http://clkads.com/*",
      "http://player.vimeo.com/*",
      "http://isohunt.com/*.php*",
      "http://www.roulettebotplus.com/*",
      "http://pl.hornygirlsexposed.com/*",
      "http://survey-awardscenter.net/*",
      "http://7.rotator.wigetmedia.com/*"
    ]
  },
  ["blocking"]);

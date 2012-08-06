chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    // alert("url intercepted: " + info.url);
    return {cancel: true};
  },
  {
    urls: [
      "http://clkads.com/*",
      "http://isohunt.com/*.php*",
    ]
  },
  ["blocking"]);

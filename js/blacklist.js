storage = chrome.storage.local;

function getDefaultMblackList() {
	return {
		movies : []
	};
}

function resetMblacklist() {
	storage.remove('mblacklist');
	var def = getDefaultMblackList();
	updateBlacklist(def);
	mblacklist = def;
}

function updateBlacklist(mblacklist) {
	storage.set({
		'mblacklist' : mblacklist
	});
}

function isBlacklisted(movie) {
	for ( var i in mblacklist.movies) {
		if (mblacklist.movies[i] == movie) {
			return true;
		}
	}
	return false;
}

function addToBlackList(movie) {
	console.log("blacklisting movie: '" + movie + "'");
	mblacklist["movies"].push(movie);
	updateBlacklist(mblacklist);
}

function removeNulls(arr) {
	var res = [];
	for ( var i in arr) {
		if (arr[i] != undefined) {
			res.push(arr[i]);
		}
	}
	return res;
}

function enableSaveDiscard(really) {
	if (really) {
		$('#discard').removeAttr("disabled");
		$('#save').removeAttr("disabled");
	} else {
		$('#discard').attr("disabled", "disabled");
		$('#save').attr("disabled", "disabled");
	}
}

function buildHtmlBl() {
	var theHtml = "<table><tr></tr>";
	for ( var i in mblacklist.movies) {
		var colMovie = "<td>" + mblacklist.movies[i] + "</td>";
		var colRemove = "<td><button class='res' name='" + i + "'>resurrect</button></td>";
		theHtml = theHtml + "<tr id='movie_" + i + "'>" + colMovie + colRemove + "</tr>";
	}
	theHtml = theHtml + "</table>";
	$('#blacklist_anch').empty().append(theHtml);

	$('.res').click(function() {
		var id = this.name;
		delete mblacklist.movies[id];
		$("#movie_" + id).hide();
		enableSaveDiscard(true);
	});
	enableSaveDiscard(false);
}

$(document).ready(function() {

	chrome.storage.local.get([ 'mblacklist' ], function(result) {
		if (result.mblacklist == undefined) {
			mblacklist = getDefaultMblackList();
		} else {
			mblacklist = result.mblacklist;
			mblacklist.movies.sort();
		}

		console.log("mblacklist = " + JSON.stringify(mblacklist));

		$('#save').click(function() {
			mblacklist.movies = removeNulls(mblacklist.movies);
			updateBlacklist(mblacklist);
			buildHtmlBl();
		});

		$('#discard').click(function() {

			chrome.storage.local.get([ 'mblacklist' ], function(result) {
				if (result.mblacklist == undefined) {
					mblacklist = getDefaultMblackList();
				} else {
					mblacklist = result.mblacklist;
					mblacklist.movies.sort();
				}
				buildHtmlBl();
			});
		});

		$('#resurrectAll').click(function() {
			mblacklist = getDefaultMblackList();
			buildHtmlBl();
			enableSaveDiscard(true);
		});

		buildHtmlBl();

	});

});
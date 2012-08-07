var storage = chrome.storage.local;

function getDefaultOptions() {
	return {
		General : {
			Enable_this_plugin: true,
			Integrate_with_PirateBay : true,
			Integrate_with_IsoHunt : true,
			Remove_adds_on_PirateBay_and_IsoHunt : true
		},
		Movie_description_downloading : {
			Download_automatically : true,
			One_at_a_time : false,
			Add_buttons_to_download_manually_on_fail : true
		},
		Cache : {
			Use_cache : true,
			TTL_in_hours : "48"
		},
		Links : {
			Add_links : true,
			Add_Google_Search_link : true,
			Add_Google_Graphic_link : true,
			Add_Filmweb_link : true,
			Add_IMDB_link : true,
			Use_original_title_as_query_param : true,
			Use_movie_title_as_query_param : false
		},
		Filmweb_Integration_Options : {
			Mark_movies_with_rating_greater_or_equal_than : "7.0"
		}
	};
}

function resetOptions() {
	storage.remove('opts');
	storage.set({
		'opts' : getDefaultOptions()
	});
}

function populateOptions(opts) {
	for ( var categoryName in opts) {
		category = opts[categoryName];
		for ( var field in category) {
			node = $("#" + categoryName).find('input[name=' + field + ']');
			if (typeof (category[field]) == "boolean") {
				node.attr('checked', category[field]);
			} else if (typeof (category[field]) == "string") {
				node.attr('value', category[field]);
			}
		}
	}
}

function reloadOptions() {
	storage.get('opts', function(result) {
		try {
			populateOptions(result.opts);
		} catch (e) {
			console.log('error in reloadOptions: ' + e);
		}
	});
}

function saveOptions() {
	opts = getDefaultOptions();
	for ( var categoryName in opts) {
		category = opts[categoryName];
		for ( var field in category) {
			node = $("#" + categoryName).find('input[name=' + field + ']');
			if (typeof (category[field]) == "boolean") {
				category[field] = node.is(':checked');
			} else if (typeof (category[field]) == "string") {
				category[field] = node.attr('value');
			}
		}
	}
	storage.set({
		'opts' : opts
	});
}

function buildHtml() {
	theBody = $("#body");
	opts = getDefaultOptions();
	for ( var categoryName in opts) {
		theBody.append("<div id='" +categoryName + "'></div>");
		
		category = opts[categoryName];
		node = $("#" + categoryName);
		htmlStr = "<fieldset><legend>"+categoryName.replace(/_/gi, " ")+"</legend>";
		
		for ( var fieldName in category) {

			typeOfNode = typeof (category[fieldName]);
			humanReadable = fieldName.replace(/_/gi, " ");
			if (typeOfNode == "boolean") {
				htmlStr = htmlStr + ("<input name='" + fieldName + "' type='checkbox'>" + humanReadable + "</input>");
			} else if (typeOfNode == "string") {
				htmlStr = htmlStr + (humanReadable+" <input name='" + fieldName + "' type='text' size='4'/>");
			}
			htmlStr = htmlStr + ("<br/>");
		}
		
		htmlStr = htmlStr + "</fieldset>";
		node.append(htmlStr);
	}
}

$(document).ready(function() {

	buildHtml();
	reloadOptions();

	$('#resetOptions').click(function() {
		resetOptions();
		reloadOptions();
	});

	$('#saveOptions').click(function() {
		saveOptions();
		reloadOptions();
	});
});

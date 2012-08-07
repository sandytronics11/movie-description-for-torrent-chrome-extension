var storage = chrome.storage.local;

function getDefaultOptions() {
	return {
		General : {
			Enable_this_plugin: true,
			Integrate_with_PirateBay : true,
			Integrate_with_IsoHunt : true,
			Remove_adds_on_PirateBay_and_IsoHunt : true
		},
		Filmweb_Integration_Options : {
			Integrate_with_Filmweb : true,
			Mark_movies_with_rating_greater_or_equal_than : "7.0"
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
		}
	};
}

function resetOptions() {
	storage.remove('opts');
	storage.set({
		'opts' : getDefaultOptions()
	});
}

function updateOptions(opts) {
	storage.set({
		'opts' : opts
	});
}
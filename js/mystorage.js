var storage = chrome.storage.local;

function getDefaultOptions() {
	return {
		General : {
			Enable_this_plugin : true,
			Integrate_with_PirateBay : true,
			Integrate_with_IsoHunt : true,
			Remove_adds_on_PirateBay_and_IsoHunt : true
		},
		Filmweb_Integration_Options : {
			Integrate_with_Filmweb : true,
			Download_one_movie_descryption_at_a_time : true,
			Mark_movies_with_rating_greater_or_equal_than : "7.0"
		},
		Movie_cache : {
			Use_cache : true,
			Expire_after_hours : "48"
		},
		Links : {
			Add_links : true,
			Add_Google_Search_link : true,
			Add_Google_Graphic_link : true,
			Add_Filmweb_link : true,
			Add_IMDB_link : true,
			Use_original_title_as_query_param : false,
			Use_movie_title_as_query_param : true
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
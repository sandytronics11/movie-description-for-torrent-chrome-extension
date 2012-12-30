"use strict";

function Options() {
	this.opts = this.getDefault();
}

Options.prototype.load = function(callback) {
	var that = this;
	storage.get('opts', function(result) {
		if (result.opts == undefined) {
			that.opts = that.getDefault();
		} else {
			that.opts = result.opts;
		}
		callback(result);
	});
};

Options.prototype.getDefault = function() {
	return {
		General : {
			Enable_this_plugin : true,
			Integrate_with_PirateBay : true,
			Integrate_with_IsoHunt : true,
			Remove_adds_on_PirateBay_and_IsoHunt : true
		},
		Integration : {
			Download_one_movie_descryption_at_a_time : true,
			Display_detailed_informations : true
		},
		IMDB : {
			Integrate_with_IMDB : true,
			Mark_movies_with_rating_greater_or_equal_than : "6.5",
			Hide_movies_with_rating_less_than : "5.0",
			Expire_cache_after_hours : "48",
			Show_movie_rating_only : false
		},
		FilmWeb : {
			Integrate_with_FilmWeb : true,
			Fallback_to_IMDB_when_cant_find_movie : true,
			Mark_movies_with_rating_greater_or_equal_than : "7.0",
			Hide_movies_with_rating_less_than : "6.1",
			Expire_cache_after_hours : "48",
			Show_movie_rating_only : false
		},
		Links : {
			Add_links : true,
			Add_Google_Search_link : true,
			Add_Google_Graphic_link : true,
			Add_Filmweb_link : true,
			Add_IMDB_link : true,
			Add_hide_movie_link : true,
			Use_torrent_title_as_query_param : false,
			Use_movie_title_as_query_param : true
		},
		Blacklist : {
			Display_movie_descryption : true,
		}
	};
};

Options.prototype.reset = function() {
	this.opts = this.getDefault();
	this.save();
};

Options.prototype.save = function() {
	chrome.storage.local.set({
		'opts' : this.opts
	});
};

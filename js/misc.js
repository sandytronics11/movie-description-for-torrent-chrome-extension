function replaceWith(node, str){
	node.empty().append(str);
}

function getAjaxIcon() {
	imgUrl = chrome.extension.getURL("ajax_loading_small.gif");	
	return "<img src=\""+imgUrl+"\" /></td>";
}

function call_filmweb(opts, filmwebNode, filmTitle) {
	$.ajax({
	  url: "http://www.filmweb.pl/search?"+$.param({q: filmTitle }),
	  success: function(data) {
		  firstFilm = $(data).find("#searchFixCheck").children(":first").find(".searchResultCol_2_wrapper");					
			if (firstFilm.length == 0) {
				replaceWith(filmwebNode, "Can't find '"+filmTitle+"'.");
			} else {
				firstFilm.find("a[href]").each(function() {
					i = this.href.indexOf("/");
					i = this.href.indexOf("/",i+1);
					i = this.href.indexOf("/",i+1);
					this.href = "http://www.filmweb.pl"+this.href.substring(i);
				});
				replaceWith(filmwebNode, firstFilm);
				
				try{
					rating = firstFilm.find(" .searchResultRating").contents()[0].wholeText.replace("/\\,/gi", ".");
					if (parseFloat(rating) >= parseFloat(opts.Filmweb_Integration_Options.Mark_movies_with_rating_greater_or_equal_than)){
						filmwebNode.css('background-color', '#FFFF99');
					}
				}catch(err){
				}
				
			}
	  },
	  failure:function(data) {
		  replaceWith(filmwebNode, "Can't connect to filmweb");
	  }
	});	
}

function trim(str) {
	 return str.replace(/^\s+|\s+$/g, "");
}

function removeAll(from, what) {
	for (i in what) {
		from = from.replace(new RegExp(what[i],"gi"), "");
	}
	return from;
}

function get_clean_title_isohunt(originalTitle) {
	filmNameClean = originalTitle;
	
	what = ["\\[.+\\]","UCF.97", "x264","dvdr","xvid", "highres", "DVD Rip", "DVD-R",
            "xxx", "porn", "bollywood", "animation", "Documentary", "Romance", "Biography", "Sports", "Fantasy", "comedy","drama",
            "crime","anime","adventure","Sci-Fi", "Tutorial", "Mystery", "Family", "Dance", "War", "western","horror","animation","thriller","westerns","action","pop"];
	for (i in what) {
		filmNameClean = filmNameClean.replace(new RegExp("^"+what[i]+DELIMITER,"gi"), "");
	}
	
	filmNameClean = filmNameClean.replace(/WITOWITO/gi, "");
		
	return get_clean_title_pirate(filmNameClean);
}

function getFirstYear(str) {
	tmp = str.match(new RegExp("[1-2][0-9][0-9][0-9]","gi"));
	if (tmp!=null && tmp.length > 0) {
		return tmp[0];
	}
	return null;
}

function get_clean_title_pirate(originalTitle) {
	
	movieYear = null;
	possibleMovieTitle = false;
	filmNameClean = originalTitle;
	year = filmNameClean.match(new RegExp("[\\(\\[\\ \\.\\*\\-\\{][1-2][0-9][0-9][0-9][\\)\\]\\ \\.\\*\\}\\[\\-]","gi"));
	if (year!=null && year.length > 0) {
		movieYear = getFirstYear(year[0]);
		i = filmNameClean.indexOf(year[0]);
		filmNameClean = filmNameClean.substring(0, i);
		possibleMovieTitle = true;
	}

	filmNameClean = filmNameClean.replace(new RegExp("\\[.+\\]","gi"), "");
	filmNameClean = filmNameClean.replace(new RegExp("\\(.+\\)","gi"), "");
	
	special = filmNameClean.match(new RegExp("KLAXXON|LIMITED|HDTV|SWEDISH|SWESUB|BDRIP|DVD|UNRATED|720p", "gi"));
	if (special!=null && special.length > 0) {
		i = filmNameClean.indexOf(special[0]);
		filmNameClean = filmNameClean.substring(0, i);
		possibleMovieTitle = true;
	}

	if (!possibleMovieTitle) {
		return null;
	}

	filmNameClean = filmNameClean.replace(new RegExp("[\\[\\]\\(\\)\\.\\-\\=]", "gi"), " ");

	ttr = [
		"XDM", "AAC", "HD", "CAM", "DVDScrRip", "Dvdscr", "Rip" , "1CD", "2CD", "MP3", "x264 5.1", "x264",
		"dvd5", "DVDRip", "RRG", "Xvid", "ICTV", "NL subs", "IPS", "Rel -", "\\*", "720p", "Hindi", "-", "BRRip", 
		"\\(Rel \\)", "\\( Rel \\)", "\\( \\)", "\\(\\)" ];
	for (i in ttr) {
		filmNameClean = filmNameClean.replace(new RegExp(ttr[i],"gi"), "");
	}

	filmNameClean = trim(filmNameClean);
	
	if (filmNameClean=="") {
		return null;
	}
	
	return {
			year : movieYear,
			title : filmNameClean
		};
}

function get_links(optLiks, param) {
	
	node = $("<p></p>");
	if (optLiks.Add_Google_Search_link) {
		node.append("<a href='https://www.google.pl/search?"+$.param({q: param.title })+"' target='_blank'>[search]</a>");
		node.append("<br/>");
	}
	if (optLiks.Add_Google_Graphic_link) {
		node.append("<a href='https://www.google.pl/search?"+$.param({safe:"off", q: param.title, tbm:"isch"})+"' target='_blank'>[pics]</a>");
		node.append("<br/>");
	}
	if (optLiks.Add_Filmweb_link) {
		node.append("<a href='http://www.filmweb.pl/search?"+$.param({q: param.title }) +"' target='_blank'>[filmweb]</a>");
		node.append("<br/>");
	}
	if (optLiks.Add_IMDB_link) {
		yearInfo = "";
		if (param.year != null){
			yearInfo = " ("+param.year+")";
		}
		node.append("<a href='http://www.imdb.com/find?"+$.param({q: param.title+yearInfo }) +"&s=tt' target='_blank'>[imdb]</a>");
		node.append("<br/>");
	}
	return node;
}


function is_pirate_bay(){
	return window.location.hostname.indexOf("pirate") >= 0;
}
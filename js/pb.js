var WITO = {
	
	getmyfilms: function(){
	
		$('iframe').remove();
		$('#tableHead').children(":first").append("<th>Filmweb</th>");
		$('#tableHead').children(":first").append("<th>Links</th>");
		
		$('#searchResult').find("tbody").children().each(function(index) {
		
			$(this).append("<td id=\"filmweb_"+index+"\"></td>")
			$(this).append("<td id=\"links_"+index+"\"></td>")
			
			var original = $(this).find(" .detName").children(":first").html()
			
								
			linksNode = $('#searchResult').find("#links_"+index)						
			linksNode.append("<a href='https://www.google.pl/search?"+$.param({q: original })+"' target='_blank'>[search]</a>")
			linksNode.append("<br/>")
			linksNode.append("<a href='https://www.google.pl/search?"+$.param({safe:"off", q: original, tbm:"isch"})+"' target='_blank'>[pics]</a>")
			linksNode.append("<br/>")
			linksNode.append("<a href='http://www.filmweb.pl/search?"+$.param({q: original }) +"' target='_blank'>[filmweb]</a>")
			
			var filmNameClean = original
			n = filmNameClean.indexOf("(");
						
			years = filmNameClean.match(new RegExp("[\\(\\[\\ \\.\\*][1-2][0-9][0-9][0-9][\\)\\]\\ \\.\\*\\[]","gi"))
			if (years!=null && years.length > 0) {
				n = filmNameClean.indexOf(years[0])
				filmNameClean = filmNameClean.substring(0, n)
			}else {
				special = filmNameClean.match(new RegExp("SWEDISH|SWESUB|BDRIP|DVD|UNRATED|720p|\\(Movie\\)", "gi"))
				
				if (special!=null && special.length > 0) {
					n = filmNameClean.indexOf(special[0])
					filmNameClean = filmNameClean.substring(0, n)
				}else {
					filmNameClean = undefined
				}
			}
					
			toappnode = $('#searchResult').find("#filmweb_"+index)					
			if (filmNameClean != undefined) {			
			
				filmNameClean = filmNameClean.replace(new RegExp("[\\[\\]\\(\\)\\.\\-\\=]", "gi"), " ");
				
				ttr = ["XDM", "AAC", "HD", "CAM", "DVDScrRip", "Dvdscr", "Rip" , "1CD", "2CD", "MP3", "x264 5.1", "x264",
				"dvd5", "DVDRip", "RRG", "Xvid", "ICTV", "NL subs", "Rel -", "\\*", "720p", 
				"Hindi", "-", "BRRip", "\\(Rel \\)", "\\( Rel \\)", "\\( \\)", "\\(\\)"]
				for (var i=0; i<ttr.length; i++) {
					var patt=new RegExp(ttr[i],"gi");
					filmNameClean = filmNameClean.replace(patt, "");
				}				
			
				var imgUrl = chrome.extension.getURL("ajax_loading_small.gif");
				toappnode.append("<img src=\""+imgUrl+"\" />")
								
			} else {				
				toappnode.append("unparsable")				
			}
						
			if (filmNameClean != undefined) {	
			
				searchUrl = "http://www.filmweb.pl/search?"+$.param({q: filmNameClean })
	
				$.ajax({
				  url: searchUrl,
				  success: function(data){
				  				  				  
					toappnode = $('#searchResult').find("#filmweb_"+index)
					toappnode.empty()
					
					firstFilm = $(data).find("#searchFixCheck").children(":first").find(".searchResultCol_2_wrapper")					
					if (firstFilm.length == 0) {
						toappnode.append("Can't find '"+filmNameClean+"'.")
					} else {
						firstFilm.find("a[href]").each(function() {
							n=0
							n=this.href.indexOf("/",n+1);
							n=this.href.indexOf("/",n+1);
							n=this.href.indexOf("/",n+1);
							this.href = "http://www.filmweb.pl"+this.href.substring(n)
					   });
						toappnode.append(firstFilm)
					}
					
				
				  }
				});	
			
			}
			
		});	
	}
}

$(document).ready(function(){
	WITO.getmyfilms();
});


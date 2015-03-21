// JavaScript Document
//$(window).load(function() {
function gridPhotos(parentElement){
    var photo_array = null;
    var lastWidth = 0;

    // only call this when either the data is loaded, or the windows resizes by a chunk
    var f = function()
    {
        // width of div to contain the images
		lastWidth = $(parentElement + " div.picstest").innerWidth() - 15;
        $(parentElement + " div.picrow").width(lastWidth);
        processPhotos(parentElement, photo_array, lastWidth);
    };
    
    var tags = "love";
	photo_array = $(parentElement + " div.photo-obj").children();
	f();
	

    $(window).resize(function() { 
        var nowWidth = $(parentElement + " div.picstest").innerWidth();

        // test to see if the window resize is big enough to deserve a reprocess
        if( nowWidth * 1.1 < lastWidth || nowWidth * 0.9 > lastWidth )
        {
            // if so call method
            f();
        }
    });
}
//});

function processPhotos(parentElement, photos, lastWidth)
{   
    // get row width - this is fixed.
    var w = $(parentElement + " div.picrow").innerWidth();
    
    // initial height - effectively the maximum height +/- 10%;
    var h = 180;
    // margin width
    var border = 2;
	
    // store relative widths of all images (scaled to match estimate height above)
    var ws = [];
    $.each(photos, function(key, val) {
        var wt = parseInt(val.width, 10);
        var ht = parseInt(val.height, 10);
        if( ht != h ) { wt = Math.floor(wt * (h / ht)); }
        ws.push(wt);
    });

    // total number of images appearing in all previous rows
    var baseLine = 0; 
    var rowNum = 0;
	
	// index for photo's id
	var n = 0;
	
	// number of images appearing in this row
    var c = 0;
	
    //while(rowNum++ < d.length)
	while (baseLine < photos.length)
    {
		
		rowNum++;
		
		// add a div to contain images
    	$(parentElement + " .ref-context-img").append("<div class='picrow'></div>");
		
		var d_row = $(parentElement + " div.picrow").last();
		d_row.width(lastWidth);
		d_row.empty();
        
        c = 0;
		
        // total width of images in this row - including margins
        var tw = 0;
		
		var currIndex = 0;
        
        // calculate width of images and number of images to view in this row.
        while( tw * 1.1 < w)
        {
            currIndex = baseLine + c++;
			if(currIndex == photos.length) {break;}
			tw += ws[currIndex] + border * 2;
        }
        // Ratio of actual width of row to total width of images to be used.
        var r = w / tw; 
        // image number being processed
        var i = 0;
        // reset total width to be total width of processed images
        tw = 0;
        // new height is not original height * ratio
        var ht = (Math.floor(h * r) < (h * 1.1))?Math.floor(h * r) : (h * 1.1);
        while( i < c )
        {
            var photo = photos[baseLine + i];
            // Calculate new width based on ratio
			if(photo){
				var wt = (ht == (h * 1.1))?Math.floor(parseInt(photos[baseLine + i].width,10) * (h * 1.1) / parseInt(photos[baseLine + i].height)):Math.floor(ws[baseLine + i] * r);
				// add to total width with margins
				tw += wt + border * 2;
				// Create image, set src, width, height and margin
				(function() {
					var url = photo.src;
					var img_id = n + "_" +url.substring(url.lastIndexOf("/")+1);
					n++;
					var a = $('<a></a>', {class: "is-selected",href: "#", id: img_id}).css("margin", border + "px");
					var img = $('<img/>',{class: "photo", src: url, width: wt});

					var currentIndex = baseLine + i;
					
					a.append(img);
					d_row.append(a);
					
					// Add Check icon on top of selected image
					var span = $('<span></span>', {class: "select-img"});
					a.append(span);
					a.click(selectImg);
				})();	
			}
			i++;
        }
		if(photo){
			// if total width is slightly smaller than 
			// actual div width then add 1 to each 
			// photo width till they match
			i = 0;
			while( tw < w )
			{
				var img1 = d_row.find("img:nth-child(" + (i + 1) + ")");
				$(img1).each(function(){
					$(this).width($(this).width() + 1);				  
				});
				i = (i + 1) % c;
				tw++;
			}
			// if total width is slightly bigger than 
			// actual div width then subtract 1 from each 
			// photo width till they match
			i = 0;
			while( tw > w )
			{
				var img2 = d_row.find("img:nth-child(" + (i + 1) + ")");
				$(img2).each(function(){
					$(this).width($(this).width() - 1);				  
				});
				i = (i + 1) % c;
				tw--;
			}
		}
		
        // set row height to actual height + margins
        d_row.height(ht + border * 2);
    
        baseLine += c;
    }
}
function selectImg(){
	var imgID = this.id;
	var span = document.getElementById("check_" + imgID);

	if($(this).hasClass("is-selected")){
		$(this).removeClass("is-selected");
		$(span).hide();
	}
	else{
		$(this).addClass("is-selected");	
		$(span).show();
	}

	return false;
}
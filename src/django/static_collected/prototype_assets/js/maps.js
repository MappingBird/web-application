// JavaScript Document
function showSavePanel(){ // move map to right to show search panel
	$("#map").animate(
		  {
			  width: '-=420',
			  left: 420
		  }, 'linear'
	);
}

function rotateAnimation(){ // animation for searching locations
	
	var $rota = $(".loading-img"),
        degree = 0,
        timer;

    function rotate() {    
        $rota.css({ transform: 'rotate(' + degree + 'deg)'});
        // timeout increase degrees:
        timer = setTimeout(function() {
            ++degree;
            rotate(); // loop it
        },1);
    }

    rotate(); 
}

function showSaveContents(){ // move map to right to display save panel
	$(".save-content").height($("#map").height() - 64);
	$(".save-content").css("top", "94px");
	$(".save-content").animate(
		  {
			  left: 0
		  }, 'linear'
	);
	$("#save-to-map").click(function(e){
		e.preventDefault();
		savePlaceComplete();
	});
}

function showCollectionMenu(){ // show collection drop-down menu
	$("#collections-selection").replaceWith("<div class='empty-block'></div>");
	$(".collections-menu").show();
}

function savePlaceComplete(){ // Animation after place is saved
	$("#map").animate(
		  {
			  width: '+=420',
			  left: 0
		  }, 'linear', function(){
				$(".collection-list-wrapper").show();
			  	$(".save-panel").hide();
				$("#map").animate(
					{
						height: '-=50',
						top: '+=50'
					}, 100
				);
				$("#place-saved-alert").animate(
					{
						top: '+=45'
					}, 100
				);
				$(".pingismo-pin .pin-popup").hide();
				$(".pingismo-pin .icon-check").show();
				
				// when dismiss alert
				$("#place-saved-alert button").click(function(){
					$(".pingismo-pin .icon-check").hide();
				});
			  }
	);
	
}

function showCollectionList(){ // Move map to left to display list of collection
	if($("#map").css("left") == '0px' || $("#map").css("left") == 'auto' || $("#list").css("left") == '0px' || $("#list").css("left") == 'auto'){
		resetMapSize();
		$("#map").animate(
			  {
				  width: '-=300',
				  left: 300
			  }, 'linear'
		);
		$("#list").animate(
			  {
				  width: '-=300',
				  left: 300
			  }, 'linear'
		);
		
		$('.icon-expand-collapse').animate({ textIndent: 90 }, {
			step: function(now,fx) {
			  $(this).css('-webkit-transform','rotate('+now+'deg)'); 
			}
		},'linear');
		
		$("#edit-list-btn").click(function(e){
			e.preventDefault();
			if($("#edit-list-btn").text() == "Edit"){
				$(".collection-list-wrapper .nav-stacked a.collection").addClass("edit");
				$("#edit-list-btn").text("Done");
			} else{
				$(".collection-list-wrapper .nav-stacked a.collection").removeClass("edit");
				$("#edit-list-btn").text("Edit");
			}
		});
				
		// move pins (for prototype only!!!!!!!!!!!!!!!!!!!)
		$(".pingismo-pin").animate(
			{
				'margin-left': '+=300'
			}, 'linear'
		);
		
	} else {
		resetMapSize();
		$('.icon-expand-collapse').animate({ textIndent: 0 }, {
			step: function(now,fx) {
			  $(this).css('-webkit-transform','rotate('+now+'deg)'); 
			}
		},'linear');
		
	}
}

function resetMapSize(){ // Reset map to full screen
	var vdocWidth = $(document).width();
	if(vdocWidth != $("#map").width()){
		$("#map").animate(
			{
				width: vdocWidth,
				left: 0
			}, 'linear'
		);
		$("#list").animate(
			{
				width: vdocWidth,
				left: 0
			}, 'linear'
		);
		$('.icon-expand-collapse').animate({ textIndent: 0 }, {
			step: function(now,fx) {
			  $(this).css('-webkit-transform','rotate('+now+'deg)'); 
			}
		},'linear');
		
		$(".pin-popup .pin-popup-img i").removeClass("is-expanded");
		
		// move pins (for prototype only!!!!!!!!!!!!!!!!!!!)
		$(".pingismo-pin").animate(
			{
				'margin-left': -155
			}, 'linear'
		);
	}
}

function showRefDetails(){ // Move map to right to show the area of pin's content
	if(!$(".pin-popup .pin-popup-img i.is-expanded").length){
		resetMapSize();
		showPinContent();
		
		$("#map").animate(
			{
				width: '-=655'
			}, 'linear'
		);
		$(".pin-popup .pin-popup-img i").addClass("is-expanded");
	} else {
		resetMapSize();
		if($("#cancel-delete-pin-btn").is(":visible")){
			$(".delete-pin-wrapper").hide();
			$(".pin-content-wrapper").css("top", 0).height($(".pin-content-wrapper").height() + 300);
		}
		$(".pin-content-wrapper").removeClass("editable");
		$(".pin-content-wrapper").hide();
		$(".pin-popup .pin-popup-img i").removeClass("is-expanded");
	}
}

function showPinContent(){ // Display content of pin after click on pin's popup
	$(".pin-content-wrapper").show();
	gridPhotos(".pin-content");
	$(".pin-content-wrapper .pingismo-proceed").click(function(e){ // Close content of pin after click on close button
		e.preventDefault();
		resetMapSize();
		$(".pin-content-wrapper").removeClass("editable");
		$(".pin-content-wrapper").hide();
		$(".pin-popup .pin-popup-img i").removeClass("is-expanded");
	});
	$("#edit-pin-content-btn").click(function(e){ // Click Edit button to edit pin content
		e.preventDefault();
		editPinContent();
	});
}

function editPinContent(){ // Switch Pin Content to edit mode
	$(".pin-content-wrapper").addClass("editable");
	$("#done-edit-pin-content-btn").click(function(e){ // Click Edit button to edit pin content
		e.preventDefault();
		$(".pin-content-wrapper").removeClass("editable");
	});
	$("#del-pin-content-btn").click(function(e){ // Click Delete pin button
		e.preventDefault();
		$(".pin-content-wrapper").fadeOut('slow').animate(
			{ top : 300, height : '-=300' },
			{ duration: 'slow', easing: 'linear', queue: false, complete: confirmDeletePin});
	});
}
function confirmDeletePin(){
	$(".delete-pin-wrapper").fadeIn("slow");
	$("#delete-pin-btn").click(function(e){ // Click to confirm to delete pin
		e.preventDefault();
		$(".delete-pin-wrapper").fadeOut('slow').animate(
			{ top : 300 },
			{ duration: 'slow', easing: 'linear', queue: false, complete: removeaPin});
	});
	$("#cancel-delete-pin-btn").click(function(e){ // Click to cancel to delete pin
		e.preventDefault();
		$(".delete-pin-wrapper").fadeOut('slow').animate(
			{ top : 300 },
			{ duration: 'slow', easing: 'linear', queue: false, complete: revealaPin});
	});
}
function removeaPin(){
	resetMapSize();
	$("#pin-eiffel-tower").fadeOut('linear');
}
function revealaPin(){
	$(".pin-content-wrapper").fadeIn('slow').animate(
			{ top : 0, height : '+=300' },
			{ duration: 'slow', easing: 'linear', queue: false});
	$(".delete-pin-wrapper").animate({ top : 0 });
}

function cropListPhotos(){ // layout the photos in list view
	
	var tarPhoto, rat;
	
	// layout the photos for column_20
	if($(".column_20") != 0){
		tarPhoto = $(".column_20 .main-photo img");
		tarPhoto.each(function(){
			rat = $(".column_20 .main-photo").width()/$(this).width();
			
			if($(this).height()*rat < $(".column_20 .main-photo").height()){
				$(this).height($(".column_20 .main-photo").height());
				$(this).css("margin-left",-1*($(this).width()-$(".column_20 .main-photo").width())/2);
			} else {
				$(this).width($(".column_20 .main-photo").width());
				$(this).css("margin-top",-1*($(this).height()-$(".column_20 .main-photo").height())/2);
			}
		});
	}
	
	// layout the photos for column_25
	if($(".column_25") != 0){
		tarPhoto = $(".column_25 .main-photo img");
		tarPhoto.each(function(){
			rat = $(".column_25 .main-photo").width()/$(this).width();
			
			if($(this).height()*rat < $(".column_25 .main-photo").height()){
				$(this).height($(".column_25 .main-photo").height());
				$(this).css("margin-left",-1*($(this).width()-$(".column_25 .main-photo").width())/2);
			} else {
				$(this).width($(".column_25 .main-photo").width());
				$(this).css("margin-top",-1*($(this).height()-$(".column_25 .main-photo").height())/2);
			}
		});	
	}
	
	// layout the photos for column_40
	if($(".column_40") != 0){
		tarPhoto = $(".column_40 .main-photo img");
		tarPhoto.each(function(){
			rat = $(".column_40 .main-photo").width()/$(this).width();
			
			if($(this).height()*rat < $(".column_40 .main-photo").height()){
				$(this).height($(".column_40 .main-photo").height());
				$(this).css("margin-left",-1*($(this).width()-$(".column_40 .main-photo").width())/2);
			} else {
				$(this).width($(".column_40 .main-photo").width());
				$(this).css("margin-top",-1*($(this).height()-$(".column_40 .main-photo").height())/2);
			}
		});
	}
	
	// layout the photos for column_40_2
	if($(".column_40_2") != 0){
		tarPhoto = $(".column_40_2 .main-photo img");
		tarPhoto.each(function(){
			rat = $(".column_40_2 .main-photo").width()/$(this).width();
			
			if($(this).height()*rat < $(".column_40_2 .main-photo").height()){
				$(this).height($(".column_40_2 .main-photo").height());
				$(this).css("margin-left",-1*($(this).width()-$(".column_40_2 .main-photo").width())/2);
			} else {
				$(this).width($(".column_40_2 .main-photo").width());
				$(this).css("margin-top",-1*($(this).height()-$(".column_40_2 .main-photo").height())/2);
			}
		});
	}
	
	// layout the photos for column_50
	if($(".column_50") != 0){
		var colWidth, pHeight;
		var photoBlock = $(".column_50 .photos");
		pHeight = $(".column_50").height();
		photoBlock.each(function(){
			colWidth = $(this).width();
			tarPhoto = $(this).find(".main-photo img");
			if(tarPhoto.width() > tarPhoto.height()){ //crop first image
				tarPhoto.height(pHeight - (colWidth/2));
				var leftShift = -1*(tarPhoto.width() - colWidth)/2;
				tarPhoto.css("margin-left", leftShift);
			} else {
				tarPhoto.width(colWidth);
				$(this).find(".main-photo").height(pHeight - (colWidth/2));
				tarPhoto.css("margin-top", -1*(tarPhoto.height() - $(this).find(".main-photo").height())/2);
			}
			
			tarPhoto = $(this).find(".sub-photo img");
			tarPhoto.each(function(){
				if($(this).width() > $(this).height()){
					$(this).height(colWidth/2);
					$(this).css("margin-left", -1*($(this).width()-(colWidth/2))/2);
				} else {
					$(this).width(colWidth/2);
					$(this).css("margin-top", -1*($(this).height()-(colWidth/2))/2);
				}
			});
		});
	}
	
	
	
}
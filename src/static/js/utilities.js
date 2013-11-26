// JavaScript Document
function fixFooter(){
	if (!$("#sticky-footer-push").length > 0) {
		$("footer").before('<div id="sticky-footer-push"></div>');
	}
	var docHeight = $("#sticky-footer-push").position().top + $(".footer").outerHeight();
	if(docHeight < $(window).height()){
		var diff = $(window).height() - $("#sticky-footer-push").position().top - $(".footer").outerHeight();
		
		$("#sticky-footer-push").height( diff );
	}
	else{
		$("#sticky-footer-push").height(20);
	}	
}
function showRememberTips(){
	if($("#toRememberbtn").length == 0){
		$("#lightboxBG").width($(document).width());
		$("#lightboxBG").height($(document).height());
		$("#RememberHere").addClass("tipRememberHere");
		$("#RememberHereText").addClass("tipRememberHereText");
		$("#lightboxBG").before("<img src='img/arrow_to_button.png' id='toRememberbtn' />");
		$("#lightboxBG").before("<img src='img/arrow_to_bookmark.png' id='toBookmarkbar' style='display:none;' />");
		$("#RememberHereText").after("<a class='btn btn-info' href='#' id='GotIt'>I am done</a>");
		$("#RememberHereText").after("<img id='CloseTip' src='img/close_tip.png' style='cursor:pointer'/>");
		var toBtnTop = $("#RememberHere").position().top - 181 - 20;
		var toBtnLeft = $("#RememberHere").position().left + $("#RememberHere").width() + 20;
		var bkBtnLeft = $(window).width()/2 - $("#toBookmarkbar").width()/2;
		$("#toRememberbtn").css({"z-index" : 11, "position" : "absolute", "top" : toBtnTop, "left" : toBtnLeft}).animate(
			{
				top : '+=20',
				left : '-=20'
			}, 'slow', tipAnimation
		);
		$("#toBookmarkbar").css({"z-index" : 1100, "position" : "absolute", "top" : 20, "left" : bkBtnLeft});
		var gotTop = $("#RememberHereText").position().top + $("#RememberHereText").height() + 40;
		var gotLeft = $("#RememberHereText").position().left + 60;
		var closeTop = $("#RememberHereText").position().top + 25;
		var closeLeft = $("#RememberHereText").position().left + $("#RememberHereText").outerWidth() + 60;
		$("#GotIt").css({"z-index" : 11, "position" : "absolute", "top" : gotTop, "left" : gotLeft}).click(function(){showGetStarted();});
		$("#CloseTip").css({"z-index" : 11, "position" : "absolute", "top" : closeTop, "left" : closeLeft}).click(function(){hideRememberTips();});
	}
}
function hideRememberTips(){
	$("#lightboxBG").width(0);
	$("#lightboxBG").height(0);
	$("#RememberHere").removeClass("tipRememberHere");
	$("#RememberHereText").removeClass("tipRememberHereText");
	$("#toBookmarkbar").remove();
	$("#GotIt").remove();
	$("#CloseTip").remove();
}
function tipAnimation(){
	$("#toRememberbtn").animate({
			opacity : 0
		}, 500, function(){
			$("#toRememberbtn").remove();
			$("#toBookmarkbar").css({"display" : "block"}).animate({
				top : 0
			}, 'slow');
		});

}
var HowItWorkstep = 0;
function showGetStarted(){
	if($("#toBookmarkbar").length == 0){ //Display tutorial from nothing
		//Display mask
		$("#lightboxBG").width($(document).width());
		$("#lightboxBG").height($(document).height());
	}
	else{ //Display tutorial from clicking "Remember Here" button
		//Remove "Remember Here" elements
		$("#RememberHere").removeClass("tipRememberHere");
		$("#RememberHereText").removeClass("tipRememberHereText");
		$("#toBookmarkbar").remove();
		$("#GotIt").remove();
		$("#CloseTip").remove();
	}
	
	initTutorial();
}
function initTutorial(){ //initial How It Work
	$("#HowItWork").show();
	$("#HowItWork").addClass("howitworkWrapper");
	$("#nextStep").click(function(e){
		e.preventDefault();
		nextStep();
	});
	$("#HowItWorkStepIcon a:nth-child(1)").click(function(e){
		HowItWorkstep = 0;
		e.preventDefault();
		step1();
	});
	$("#HowItWorkStepIcon a:nth-child(2)").click(function(e){
		HowItWorkstep = 1;
		e.preventDefault();
		step2();
	});
	$("#HowItWorkStepIcon a:nth-child(3)").click(function(e){
		HowItWorkstep = 2;
		e.preventDefault();
		step3();
	});
	
	$("#resumeTutorial").click(function(e){
		HowItWorkstep = 0;
		e.preventDefault();
		resumeStep();					  
	});
	$("#skipTutorial").click(function(e){
		e.preventDefault();
		final();						  
	});
	var posLeft = ($(window).width() - $("#HowItWork").width()) / 2;
	$("#HowItWork").css("left", posLeft);
	$("#HowItWork").animate({top:'120px'}, 350, step1);
}
function nextStep(){
	switch(HowItWorkstep){
		case 0: //step 1
			step2();
			HowItWorkstep++;
			break;
		case 1: //step 2
			step3();
			HowItWorkstep++;
			break;
		case 2: //step 3
			final();
			break;
		case 3: //final
			break;
	}
}
function resumeStep(){
	$("#step1Highlight").width(0);
	$("#step1Cursor").css("top", "320px").css("left", "0px");
	$("#HowItWork-Title").fadeOut(500, function(){
		$(this).attr('src', 'img/HowItWork.png');
	}).fadeIn(500);
	$("#resumeTutorial").fadeOut(500);
	$("#skipTutorial").fadeOut(500, function(){ $(this).html("Skip &raquo;").fadeIn(500);});
	$("#skipTutorial").fadeIn(500);
	$("#step_finish").fadeOut(500, function(){
		$("#step1").fadeIn(500);
	});
	$("#HowItWorkStepIcon").fadeIn(500);
	if($("#HowItWork").position().top > 0) {step1();}
}
function step1(){ //SELECT
	//setup pagination dots style
	$("#HowItWorkStepIcon a:nth-child(1)").addClass("active");
	$("#HowItWorkStepIcon a:nth-child(2)").removeClass("active");
	$("#HowItWorkStepIcon a:nth-child(3)").removeClass("active");
	
	if($("#step2Highlight").length > 0){
		$("#step2Highlight").fadeOut(300);
	}
	if($("#stepNum").text().indexOf("STEP 1") < 0){
		//reset select text
		$("#step1Highlight").width(0);
		
		//reset text
		$("#stepNum").fadeOut(500, function(){ $(this).text("STEP 1").fadeIn(500);});
		$("#stepTitle").fadeOut(500, function(){ $(this).text("SELECT").fadeIn(500);});
		$("#stepDes").fadeOut(500, function(){ $(this).html('When you find an interesting place while browsing the internet, select its <strong>name</strong> or <strong>address</strong> with your mouse.').fadeIn(500);});
		$("#nextStep").fadeOut(500, function(){ $(this).text("NEXT").fadeIn(500);});
	}
	
	//reset browser image
	if($("#stepIllu").attr("src").indexOf("howitwork_step_browser.png") < 0){
		$("#stepIllu").fadeOut(500, function(){
				$(this).attr('src', 'img/howitwork_step_browser.png');
			}).fadeIn(500);
	}
	
	//reset cursor position
	$("#step1Cursor").position({top: 320, left: 0});
	
	//start animation
	$("#step1Cursor").delay(300).animate({top: '140px', left: '25px'}, 800, function(){ //Move cursor to top
		$("#step1Cursor").delay(100).animate({left: '90px'}, {duration: 500, queue: false}); // Move cursor to left
		$("#step1Highlight").delay(100).animate({width: '66px'} , {duration: 490, queue: false}); // Show highlight
	});
}
function step2(){ //CLICK
	//setup pagination dots style
	$("#HowItWorkStepIcon a:nth-child(1)").removeClass("active");
	$("#HowItWorkStepIcon a:nth-child(2)").addClass("active");
	$("#HowItWorkStepIcon a:nth-child(3)").removeClass("active");
	
	//update text
	$("#stepNum").fadeOut(500, function(){ $(this).text("STEP 2").fadeIn(500);});
	$("#stepTitle").fadeOut(500, function(){ $(this).text("CLICK").fadeIn(500);});
	$("#stepDes").fadeOut(500, function(){ $(this).html('Next, click the "<strong>Remember This Place</strong>" bookmark on your bookmarks bar.').fadeIn(500);});
	$("#nextStep").fadeOut(500, function(){ $(this).text("NEXT").fadeIn(500);});
	
	//reset browser image
	if($("#stepIllu").attr("src").indexOf("howitwork_step_browser.png") < 0){
	$("#stepIllu").fadeOut(500, function(){
			$(this).attr('src', 'img/howitwork_step_browser.png');
		}).fadeIn(500, function(){
				//reset highlight selected text
				if($("#step1Highlight").width() == 0){
					$("#step1Highlight").hide();
					$("#step1Highlight").width(66);
					$("#step1Highlight").fadeIn(500);
				}
			});
	}
	
	
	
	//start animation
	$("#step1Cursor").delay(300).animate({top: '40px', left: '90px'}, 800);
	$("#step2Highlight").delay(1000).fadeIn(200);
}
function step3(){ //SAVE
	//setup pagination dots style
	$("#HowItWorkStepIcon a:nth-child(1)").removeClass("active");
	$("#HowItWorkStepIcon a:nth-child(2)").removeClass("active");
	$("#HowItWorkStepIcon a:nth-child(3)").addClass("active");
	
	//update text
	$("#stepNum").fadeOut(500, function(){ $(this).text("STEP 3").fadeIn(500);});
	$("#stepTitle").fadeOut(500, function(){ $(this).text("SAVE").fadeIn(500);});
	$("#stepDes").fadeOut(500, function(){ $(this).html('Confirm the location, images and description, and then press "<strong>SAVE</strong>."').fadeIn(500);});
	$("#nextStep").fadeOut(500, function(){ $(this).text("FINISH").fadeIn(500);});
	
	//reset browser image
	if($("#stepIllu").attr("src").indexOf("howitwork_step_browser_2.png") < 0){
		$("#stepIllu").fadeOut(500, function(){
			$(this).attr('src', 'img/howitwork_step_browser_2.png');
		}).fadeIn(500);
	}
	
	//start animation
	if($("#step1Highlight").width() > 0)
		$("#step1Highlight").animate({width: '0px'},{duration: 500, queue: false});
	if($("#step2Highlight").length > 0)
		$("#step2Highlight").fadeOut({duration: 500, queue: false});
	$("#step1Cursor").delay(300).animate({top: '235px', left: '75px'}, 800);
}
function final(){ //FINAL
	if($("#HowItWork-Title").attr("src").indexOf("GetStarted.png") > 0){
		closeTutorial();
	}
	else{
		$("#HowItWork-Title").fadeOut(500, function(){
			$(this).attr('src', 'img/GetStarted.png');
		}).fadeIn(500);
		$("#resumeTutorial").fadeIn(500);
		$("#skipTutorial").fadeOut(500, function(){ $(this).text("Close").fadeIn(500);});
		$("#step1").fadeOut(500, function(){
			$("#step_finish").fadeIn(500);
		});
		$("#HowItWorkStepIcon").fadeOut(500);
	}
}
function closeTutorial(){
	$("#HowItWork").animate({top:'-520px'}, 350, function(){
		$("#HowItWork").hide();
		$("#lightboxBG").width(0);
		$("#lightboxBG").height(0);
		$("#HowItWork").removeClass("howitworkWrapper");
		HowItWorkstep = 0;
		resumeStep();
	});
}
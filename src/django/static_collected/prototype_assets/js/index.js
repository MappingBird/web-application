// JavaScript Document
function showWhatItIs(tarEle){ // Click to switch What It Is content
	var hideEle;
	$.each($(".what .what-text"), function(){
		hideEle = $(this).attr("data-target");
		
		if($(this).css("display") != "none" && tarEle != hideEle){ // Hide diplayed text
			$(".what ." + hideEle).removeClass("is-selected");
			$(".what ." + tarEle).addClass("is-selected");
			
			$(this).fadeOut("linear").animate(
				{ "margin-left" : "-=300" },
				{ duration: 'slow', easing : "linear", queue : false, complete : function() {
					displayTargetContext(tarEle);
				}} 
			);
			
			$("." + hideEle + "-img").fadeOut("linear").animate(
				{ "margin-left" : "+=300" },
				{ duration: 'slow', easing : "linear", queue : false}
			);
		}
	});
}
function displayTargetContext(tarEle){
	$("." + tarEle + "-text").css("margin-left", "-300px");
	$("." + tarEle + "-img").css("margin-left", "300px");
	$("." + tarEle + "-text").fadeIn("linear").animate(
		{ "margin-left" : "+=300"  },
		{ duration: 'slow', easing : "linear", queue : false}
	);
	$("." + tarEle + "-img").delay(600).fadeIn("linear").animate(
		{ "margin-left" : "-=300" },
		{ duration: 'slow', easing : "linear", queue : false}
	);
}

var curStep = 0;
function HowItWorks(vStep){
	if(vStep != 0) hideStep(curStep);
	
	
	if(vStep == 1) {
		if(curStep != 0){
			$(".how-nav .prev").removeClass("showme");
			$(".how-nav .prev").addClass("hideme");
		}
	} else {
		$(".how-nav .prev").removeClass("hideme");
		$(".how-nav .prev").addClass("showme");
	}
	
	
	if(vStep == 5) {
		$(".how-nav .next").removeClass("showme");
		$(".how-nav .next").addClass("hideme");
	} else {
		$(".how-nav .next").removeClass("hideme");
		$(".how-nav .next").addClass("showme");
	}
	
	switch(vStep){
		case 1:
			//hideStep2();
			//hideStep3();
			//hideStep4();
			//hideStep5();
			//$(".how-nav .prev").hide().unbind();
			//$(".how-nav .next").show().unbind();
			curStep = vStep;
			showStep(vStep);
			
			$(".how-nav-indicator li").removeClass("active");
			$(".how-nav-indicator .jump-step1").addClass("active");
			$(".how-nav .next").click(function(e){
				e.preventDefault();
				HowItWorks(2);
			});
			break;
		case 2:
			//hideStep1();
			//hideStep3();
			//hideStep4();
			//hideStep5();
			//$(".how-nav .prev").show().unbind();
			//$(".how-nav .next").show().unbind();
			curStep = vStep;
			showStep(vStep);
			
			$(".how-nav-indicator li").removeClass("active");
			$(".how-nav-indicator .jump-step2").addClass("active");
			$(".how-nav .prev").click(function(e){
				e.preventDefault();
				HowItWorks(1);
			});
			$(".how-nav .next").click(function(e){
				e.preventDefault();
				HowItWorks(3);
			});
			//$(".step2").show();
			break;
		case 3:
			//hideStep1();
			//hideStep2();
			//hideStep4();
			//hideStep5();
			//$(".how-nav .prev").show().unbind();
			//$(".how-nav .next").show().unbind();
			curStep = vStep;
			showStep(vStep);
			
			$(".how-nav-indicator li").removeClass("active");
			$(".how-nav-indicator .jump-step3").addClass("active");
			$(".how-nav .prev").click(function(e){
				e.preventDefault();
				HowItWorks(2);
			});
			$(".how-nav .next").click(function(e){
				e.preventDefault();
				HowItWorks(4);
			});
			
			//$(".step3").show();
			break;
		case 4:
			//hideStep1();
			//hideStep2();
			//hideStep3();
			//hideStep5();
			//$(".how-nav .prev").show().unbind();
			//$(".how-nav .next").show().unbind();
			curStep = vStep;
			showStep(vStep);
			
			$(".how-nav-indicator li").removeClass("active");
			$(".how-nav-indicator .jump-step4").addClass("active");
			$(".how-nav .prev").click(function(e){
				e.preventDefault();
				HowItWorks(3);
			});
			$(".how-nav .next").click(function(e){
				e.preventDefault();
				HowItWorks(5);
			});
			//$(".step4").show();
			break;
		case 5:
			//hideStep1();
			//hideStep2();
			//hideStep3();
			//hideStep4();
			//$(".how-nav .prev").show().unbind();
			//$(".how-nav .next").hide().unbind();
			curStep = vStep;
			showStep(vStep);
			
			$(".how-nav-indicator li").removeClass("active");
			$(".how-nav-indicator .jump-step5").addClass("active");
			$(".how-nav .prev").click(function(e){
				e.preventDefault();
				HowItWorks(4);
			});
			//$(".step5").show();
			break;
	}
}
function showStep(vStep){
	$(".how .step" + vStep + " h2").removeClass("hideme");
	$(".how .step" + vStep + " h2").addClass("showme");
	$(".how .step" + vStep + " p").removeClass("hideme");
	$(".how .step" + vStep + " p").addClass("showme");
	$(".how .step" + vStep + " .screenshot img").removeClass("hideme");
	$(".how .step" + vStep + " .screenshot img").addClass("showme");
}
function hideStep(vStep){
	$(".how .step" + vStep + " h2").removeClass("showme");
	$(".how .step" + vStep + " h2").addClass("hideme");
	$(".how .step" + vStep + " p").removeClass("showme");
	$(".how .step" + vStep + " p").addClass("hideme");
	$(".how .step" + vStep + " .screenshot img").removeClass("showme");
	$(".how .step" + vStep + " .screenshot img").addClass("hideme");
}
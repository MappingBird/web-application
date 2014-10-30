{% extends "./share/_layout.swig" %}

{% block ngApp %}IndexApp{% endblock %}

{% block css %}
<!-- xxbuild:css /static/css/style-index.css -->
<link href="/static/prototype_assets/css/bootstrap.min.css" rel="stylesheet" media="screen">
<link href="/static/prototype_assets/new_home/css/style.css" rel="stylesheet" media="screen">
<link href="/static/prototype_assets/new_home/css/index.css" rel="stylesheet" media="screen">
<link href="/static/prototype_assets/js/fancybox/jquery.fancybox.css" rel="stylesheet">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

{% endblock %}

{% block content %}
<section class="intro">
    <header ng-controller="userController">
        <a href="/" class="logo"></a>
        <div class="navbar pingismo-navbar pull-right middle-align" ng-show="isLoggedIn && isRegisteredUser" id="registered-user-menu">
            <ul class="nav">
                <li class="dropdown">
                    <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                        <span ng-bind="user.email"></span>
                        <b class="caret"></b>                        </a>
                    <ul class="dropdown-menu pingismo-dropdown-menu">
                        <li><a href="/app#/"><i class="icon-globe"></i> View map</a></li>
                        <li><a href="/settings"><i class="icon-wrench"></i> Settings</a></li>
                        <li class="divider"></li>
                        <li><a href="#" ng-click="logout($event)"><i class="icon-off"></i> Logout</a></li>
                    </ul>
                </li>
            </ul>
        </div>
        <div class="navbar pingismo-navbar pull-right middle-align" ng-show="isLoggedIn && !isRegisteredUser" id="unregistered-user-menu">
            <ul class="nav">
                <li class="dropdown">
                    <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                        Sign up for a MappingBird account
                        <b class="caret"></b>                        </a>
                    <ul class="dropdown-menu pingismo-dropdown-menu">
                        <li><a href="/signup"><i class="icon-user"></i> Sign Up</a></li>
                        <li><a href="/app#/"><i class="icon-globe"></i> View map</a></li>
                    </ul>
                </li>
            </ul>
        </div>
        <div class="navbar pingismo-navbar pull-right vertical-align" ng-show="!isLoggedIn" id="logged-out-menu">
            <ul class="nav">
                <li><a href="/login" class="signin">SIGN IN</a></li>
            </ul>
        </div>
    </header>
    <div class="container vertical-align">
        <h1>Have you ever forgotten places you were planning to go to?</h1>
        <p>MappingBird is the easiest way for you to remember places for future reference.</p>
        <a class="fancybox-media video-clip" id="video-link" href="https://vimeo.com/103387920">Watch 1 minute intro</a>        </div>
    <div class="scrolldown-hint">
        <img src="/static/prototype_assets/new_home/img/scrolldown-hint.gif" />
        <p>Scroll to learn more</p>
    </div>
</section>

<!-- What It Is -->
<section class="what">
    <div class="row-fluid nav-what">
        <div class="span3"></div>
        <div class="span2 save is-selected"><a href="#" class="what_btn" data-target="save"></a></div>
        <div class="span2 organize"><a href="#" class="what_btn" data-target="organize"></a></div>
        <div class="span2 access"><a href="#" class="what_btn" data-target="access"></a></div>
        <div class="span3"></div>
    </div>
    <div class="what-text save-text" data-target="save">
        <h2>Remember Places With Just a Few Clicks</h2>
        <p class="container">Just add our free “Remember This Place” bookmark to your bookmarks bar and you can save interesting places while surfing the web with just a few clicks.</p>
    </div>
    <div class="what-text organize-text" data-target="organize">
        <h2>Organize Places Any Way You Like</h2>
        <p class="container">MappingBird offers you a flexible way to group your saved places. You can group places based by a trip you're planning or topics like "My Favorite Bars" and you can even tag them.</p>
    </div>
    <div class="what-text access-text" data-target="access">
        <h2>Easy Lookup Wherever You Are</h2>
        <p class="container">MappingBird has a free Android app, so you can access your saved places whenever you need them.</p>
    </div>
    <div class="row-fluid">
        <div class="span2"></div>
        <div class="span8 text-center what-screenshot">
            <img src="/static/prototype_assets/new_home/img/save-screenshot.jpg" class="save-img" />
            <img src="/static/prototype_assets/new_home/img/organize-screenshot.jpg" class="organize-img" />
            <div class="access-img">
                <img src="/static/prototype_assets/new_home/img/access-screenshot.jpg" class="img-andriod" />
                <a href="#" target="_blank" class="btn-googleplay"></a>
                <div class="clearfix"></div>
            </div>
        </div>
        <div class="span2"></div>
    </div>
</section>
<!-- End of What It Is -->

<!-- How It Works -->
<section class="how" id="how-it-works">
    <div class="how-nav">
        <a href="#" class="prev pull-left"></a>
        <a href="#" class="next pull-right"></a>        </div>
    <h1>How It Works</h1>
    <ul class="how-nav-indicator">
        <li class="active jump-step1"><a href="javascript:HowItWorks(1);"></a></li>
        <li class="jump-step2"><a href="javascript:HowItWorks(2);"></a></li>
        <li class="jump-step3"><a href="javascript:HowItWorks(3);"></a></li>
        <li class="jump-step4"><a href="javascript:HowItWorks(4);"></a></li>
        <li class="jump-step5"><a href="javascript:HowItWorks(5);"></a></li>
    </ul>
    <div class="container pingismo-container">
        <!-- How It Works - Chrome -->
        <div class="how-chrome">
            <div class="how-step step1">
                <h2>1. Display the Bookmarks bar</h2>
                <p>Click the menu icon at the top-right of your Chrome browser and hover the mouse over Bookmarks. Make sure the <i>Show Bookmarks Bar</i> is checked.
                    You can also click <i>Ctrl+Shift+B</i> (or <i>Command+Shit+B</i> on Mac) to show the Bookmarks bar.</p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/chrome-bookmarkbar.gif" /></div>
            </div>
            <div class="how-step step2">
                <h2 class="hide">2. Drag the giant button up</h2>
                <p class="hide">
                    Drag the big "Remember This Place" button below to your Bookmarks Bar. Once you see a "+" icon, you can release the mouse.<br/><br/>
                    <a class="btn btn-giant btn-primary pingismo-btn" id="how-it-works-remember-button-chrome" type="button" href="javascript:
    (function(){var BASE='https://www.mappingbird.com/',MAP_SAVE_URL=BASE+'app#/save',search=encodeURIComponent(getSelectionHtml()),url=encodeURIComponent(window.location.href),body,listener;function strip(html){if(html.length===0){return''}var tmp=document.createElement('DIV');tmp.innerHTML=html.replace(/[\t\r\s\n]/g,' ');return tmp.textContent||tmp.innerText}function getSelectionHtml(){var html='';if(typeof window.getSelection!='undefined'){var sel=window.getSelection();if(sel.rangeCount){var container=document.createElement('div');for(var i=0,len=sel.rangeCount;i<len;++i){container.appendChild(sel.getRangeAt(i).cloneContents())}html=container.innerHTML}}else{if(typeof document.selection!='undefined'){if(document.selection.type=='Text'){html=document.selection.createRange().htmlText}}}return strip(html)}window.open(MAP_SAVE_URL+'?url='+url+'&search='+search);return})();">Remember This Place</a>                    </p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/chrome-drag.gif" class="hide" /></div>
            </div>
            <div class="how-step step3">
                <h2 class="hide">3. Select a place name or address</h2>
                <p class="hide">
                    Whenever you see an interesting place on a website, text-select name of the place or its address, and click the "<b>Remember This Place</b>" bookmark on the Bookmarks Bar.<br/><br/>
                    <!--
                    <a href="#" class="btn-highlight pingismo-btn Try-Select-Text">Try It</a>
                    -->
                </p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/chrome-website.gif" class="hide" /></div>
            </div>
            <div class="how-step step4">
                <h2 class="hide">4. Save to your map</h2>
                <p class="hide">After clicking the "Remember This Place" bookmark, add any commends you like and click off any images you don't want to save and click "<b>Save to Map</b>."</p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/chrome-save.png" class="hide" /></div>
            </div>
            <div class="how-step step5">
                <h2 class="hide">5. Start your collections</h2>
                <p class="hide">Fantastic! Now you know how to save a place to Mappingbird. Now start collecting awesome places!</p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/chrome-map.png" class="hide" /></div>
            </div>
        </div>
        <!-- End of How It Works - Chrome -->

        <!-- How It Works - Firefox -->
        <div class="how-firefox">
            <div class="how-step step1">
                <h2>1. Display the Bookmarks bar</h2>
                <p>Click the menu icon at the top-right of your Firefox browser and hover the mouse over Bookmarks. Make sure the <i>Show Bookmarks Bar</i> is checked.</p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/firefox-bookmarkbar.gif" /></div>
            </div>
            <div class="how-step step2">
                <h2 class="hide">2. Drag the giant button up</h2>
                <p class="hide">
                    Drag the big "Remember This Place" button below to your Bookmarks Bar. Once you see a "+" icon, you can release the mouse.<br/><br/>
                    <a class="btn btn-giant btn-primary pingismo-btn" id="how-it-works-remember-button-firefox" type="button" href="javascript:
    (function(){var BASE='https://www.mappingbird.com/',MAP_SAVE_URL=BASE+'app#/save',search=encodeURIComponent(getSelectionHtml()),url=encodeURIComponent(window.location.href),body,listener;function strip(html){if(html.length===0){return''}var tmp=document.createElement('DIV');tmp.innerHTML=html.replace(/[\t\r\s\n]/g,' ');return tmp.textContent||tmp.innerText}function getSelectionHtml(){var html='';if(typeof window.getSelection!='undefined'){var sel=window.getSelection();if(sel.rangeCount){var container=document.createElement('div');for(var i=0,len=sel.rangeCount;i<len;++i){container.appendChild(sel.getRangeAt(i).cloneContents())}html=container.innerHTML}}else{if(typeof document.selection!='undefined'){if(document.selection.type=='Text'){html=document.selection.createRange().htmlText}}}return strip(html)}window.open(MAP_SAVE_URL+'?url='+url+'&search='+search);return})();">Remember This Place</a>
                </p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/firefox-drag.gif" /></div>
            </div>
            <div class="how-step step3">
                <h2 class="hide">3. Select a place name or address</h2>
                <p class="hide">Whenever you see an interesting place on a website, text-select name of the place or its address, and click the "<b>Remember This Place</b>" bookmark on the Bookmarks Bar.<br/><br/>
                    <!--
                    <a href="#" class="btn-highlight pingismo-btn Try-Select-Text">Try It</a>
                    -->
                </p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/firefox-website.gif" /></div>
            </div>
            <div class="how-step step4">
                <h2 class="hide">4. Save to your map</h2>
                <p class="hide">After clicking the "Remember This Place" bookmark, add any commends you like and click off any images you don't want to save and click "<b>Save to Map</b>.</p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/chrome-save.png" /></div>
            </div>
            <div class="how-step step5">
                <h2 class="hide">5. Start your collections</h2>
                <p class="hide">Fantastic! Now you know how to save a place to Mappingbird. Now start collecting awesome places!</p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/chrome-map.png" /></div>
            </div>
        </div>
        <!-- End of How It Works - Firefox -->

        <!-- How It Works - Safari -->
        <div class="how-safari">
            <div class="how-step step1">
                <h2>1. Display the Bookmarks bar</h2>
                <p>Click the menu icon at the top-right of your Safari browser and hover the mouse over Bookmarks. Make sure the <i>Show Bookmarks Bar</i> is checked.
                    You can also click <i>Ctrl+Shift+B</i> (or <i>Command+Shit+B</i> on Mac) to show the Bookmarks bar.</p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/safari-bookmarkbar.gif" /></div>
            </div>
            <div class="how-step step2">
                <h2 class="hide">2. Drag the giant button up</h2>
                <p class="hide">
                    Drag the big "Remember This Place" button below to your Bookmarks Bar. Once you see a "+" icon, you can release the mouse.<br/><br/>
                    <a class="btn btn-giant btn-primary pingismo-btn" id="how-it-works-remember-button-safari" type="button" href="javascript:
    (function(){var BASE='https://www.mappingbird.com/',MAP_SAVE_URL=BASE+'app#/save',search=encodeURIComponent(getSelectionHtml()),url=encodeURIComponent(window.location.href),body,listener;function strip(html){if(html.length===0){return''}var tmp=document.createElement('DIV');tmp.innerHTML=html.replace(/[\t\r\s\n]/g,' ');return tmp.textContent||tmp.innerText}function getSelectionHtml(){var html='';if(typeof window.getSelection!='undefined'){var sel=window.getSelection();if(sel.rangeCount){var container=document.createElement('div');for(var i=0,len=sel.rangeCount;i<len;++i){container.appendChild(sel.getRangeAt(i).cloneContents())}html=container.innerHTML}}else{if(typeof document.selection!='undefined'){if(document.selection.type=='Text'){html=document.selection.createRange().htmlText}}}return strip(html)}window.open(MAP_SAVE_URL+'?url='+url+'&search='+search);return})();">Remember This Place</a>
                </p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/safari-drag.gif" /></div>
            </div>
            <div class="how-step step3">
                <h2 class="hide">3. Select a place name or address</h2>
                <p class="hide">Whenever you see an interesting place on a website, text-select name of the place or its address, and click the "<b>Remember This Place</b>" bookmark on the Bookmarks Bar.<br/><br/>
                    <!--
                    <a href="#" class="btn-highlight pingismo-btn Try-Select-Text">Try It</a>
                    -->
                </p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/safari-website.gif" /></div>
            </div>
            <div class="how-step step4">
                <h2 class="hide">4. Save to your map</h2>
                <p class="hide">After clicking the "Remember This Place" bookmark, add any commends you like and click off any images you don't want to save and click "<b>Save to Map</b>."</p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/chrome-save.png" /></div>
            </div>
            <div class="how-step step5">
                <h2 class="hide">5. Start your collections</h2>
                <p class="hide">Fantastic! Now you know how to save a place to Mappingbird. Now start collecting awesome places!</p>
                <div class="screenshot"><img src="/static/prototype_assets/new_home/img/chrome-map.png" /></div>
            </div>
        </div>
        <!-- End of How It Works - Safari -->
    </div>
</section>
<!-- End of How It Works -->

<!-- How It Works - Step 3 Example -->
<div class="how-select-text-ex">
    <div class="tips-wrapper">
        <h2>1. Select “Eiffel Tower” or its address at website below</h2>
        <h2>2. Click “Remember This Place” on your bookmarks bar</h2>
        <a href="#" class="close-SelectTextEx"></a>
    </div>
    <iframe src="http://www.lonelyplanet.com/france/paris/sights/landmarks-monuments/eiffel-tower" class="example-page"></iframe>
</div>
<!-- End of How It Works - Step 3 Example -->

<!-- Get Started -->
<section class="done">
    <div class="container pingismo-container">
        <img class="getstarted-img" src="/static/prototype_assets/new_home/img/macbook-air-zoom.png" />
        <div class="getstarted-btn-wrapper pull-right">
            <h1>Start creating your collections</h1>
            <p>Drag "Remember This Place" button below up to your bookmark bar to get started.</p>
            <a class="btn btn-giant btn-primary pingismo-btn" id="get-started-remember-button" type="button"  href="javascript:
    (function(){var BASE='https://www.mappingbird.com/',MAP_SAVE_URL=BASE+'app#/save',search=encodeURIComponent(getSelectionHtml()),url=encodeURIComponent(window.location.href),body,listener;function strip(html){if(html.length===0){return''}var tmp=document.createElement('DIV');tmp.innerHTML=html.replace(/[\t\r\s\n]/g,' ');return tmp.textContent||tmp.innerText}function getSelectionHtml(){var html='';if(typeof window.getSelection!='undefined'){var sel=window.getSelection();if(sel.rangeCount){var container=document.createElement('div');for(var i=0,len=sel.rangeCount;i<len;++i){container.appendChild(sel.getRangeAt(i).cloneContents())}html=container.innerHTML}}else{if(typeof document.selection!='undefined'){if(document.selection.type=='Text'){html=document.selection.createRange().htmlText}}}return strip(html)}window.open(MAP_SAVE_URL+'?url='+url+'&search='+search);return})();">Remember This Place</a>            </div>
    </div>
    <div ui-view></div>
    <footer>
        <div class="logo-copyright">
            <p class="slogan"><img src="/static/prototype_assets/new_home/img/logo-footer.png" /> Remember places for later.</p>
            <p>Copyright &copy; 2014 MappingBird LLC. All referred posts &copy; their respective owners.</p>
        </div>
        <div class="lang-contact pull-right">
            <ul class="nav nav-pills">
                <li><a href="#">繁體中文</a></li>
                <li class="divider-vertical pingismo-divider-vertical"></li>
                <li class="active"><a href="#">English</a></li>
            </ul>
            <p>
                <a href="#" class="footer-contact">Contact Us</a>
                <a href="#" class="footer-follow">Follow Us</a>
            </p>
        </div>
    </footer>
</section>
{% endblock %}

{% block postjs %}
    <script>
        // JavaScript Document
        function showScrollHint(){ //Display the hint to encourage users to scroll down
            $(".scrolldown-hint").show();
            $(".scrolldown-hint").addClass("showme");
        }
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
                    break;

                case 3:
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
                    break;

                case 4:
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
                    break;

                case 5:
                    curStep = vStep;
                    showStep(vStep);

                    $(".how-nav-indicator li").removeClass("active");
                    $(".how-nav-indicator .jump-step5").addClass("active");
                    $(".how-nav .prev").click(function(e){
                        e.preventDefault();
                        HowItWorks(4);
                    });
                    break;
            }
        }
        function showStep(vStep){
            $(".how .step" + vStep + " h2").removeClass("hide");
            $(".how .step" + vStep + " h2").removeClass("hideme");
            $(".how .step" + vStep + " h2").addClass("showme");
            $(".how .step" + vStep + " p").removeClass("hide");
            $(".how .step" + vStep + " p").removeClass("hideme");
            $(".how .step" + vStep + " p").addClass("showme");
            $(".how .step" + vStep + " .screenshot img").removeClass("hide");
            $(".how .step" + vStep + " .screenshot img").removeClass("hideme");
            $(".how .step" + vStep + " .screenshot img").addClass("showme");
        }
        function hideStep(vStep){
            $(".how .step" + vStep + " h2").removeClass("showme");
            $(".how .step" + vStep + " h2").addClass('hideme');
            $(".how .step" + vStep + " h2").bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){ $(".how .step" + vStep + " h2").addClass('hidden'); });

            $(".how .step" + vStep + " p").removeClass("showme");
            $(".how .step" + vStep + " p").addClass("hideme");
            $(".how .step" + vStep + " p").bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){ $(".how .step" + vStep + " p").addClass('hidden'); });

            $(".how .step" + vStep + " .screenshot img").removeClass("showme");
            $(".how .step" + vStep + " .screenshot img").addClass("hideme");
            $(".how .step" + vStep + " .screenshot img").bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){ $(".how .step" + vStep + " .screenshot img").addClass('hidden'); });
        }
        function iniSelectTextExample(){
            $(".how-select-text-ex").height($(document).height());
            $(".how-select-text-ex .example-page").height($(window).height() - $(".how-select-text-ex .tips-wrapper").height() - 180);
        }
    </script>

    <script>

	$(document).ready(function(){

		//show scroll down hint when banner background is loaded
		$("<img/>").attr("src", "/static/prototype_assets/new_home/img/intro-bg.jpg").load(function(){
			$(this).remove(); //prevent memory leaks
			showScrollHint();
		});
		//show while scrolling
        var show_howitworks = false;
		var show_whatitfor = false;
		var show_getstarted = false;
		var bottom_of_window;
		var bottom_of_howitworks = $("section.how").position().top + $("section.how").outerHeight()/2;
		var bottom_of_whatitfor = $("section.what").position().top + $("section.what").outerHeight()/2;
		var bottom_of_getstarted = $("section.done").position().top + $("section.done").outerHeight()/2;

		$(window).scroll(function(){
            bottom_of_window = $(window).scrollTop() + $(window).height();
            if(bottom_of_window > bottom_of_howitworks && !show_howitworks){
                show_howitworks = true;
                $(".how-nav-indicator>li").fadeIn();
                $(".how .container").addClass("showme");
				HowItWorks(1);
			}

			if(bottom_of_window > bottom_of_whatitfor && !show_whatitfor){
				show_whatitfor = true;
				$(".what .save > a").addClass("showme");
				$(".what .organize > a").addClass("showme");
				$(".what .access > a").addClass("showme");
				$(".what h2").addClass("showme");
				$(".what p").addClass("showme");
				$(".what-screenshot .save-img").delay(600).fadeIn(800);
			}

			if(bottom_of_window > bottom_of_getstarted && !show_getstarted){
				show_getstarted = true;
				$(".done .pingismo-container").addClass("showme");
				$(".done .getstarted-img").addClass("showme");
				$(".done .getstarted-btn-wrapper h1").addClass("showme");
				$(".done .getstarted-btn-wrapper p").addClass("showme");
				$(".done .getstarted-btn-wrapper a").addClass("showme");
			}
		});

		//fancybox for showing video
		$('.fancybox-media').fancybox({
			openEffect  : 'none',
			closeEffect : 'none',
			helpers : {
				media : {}
			}
		});

		//How it works
		var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
        var isFirefox = /Firefox/.test(navigator.userAgent);
        var isMSIE = /MSIE/.test(navigator.userAgent);
        if(isChrome){
            $(".how-chrome").show();
        } else if(isSafari){
            $(".how-safari").show();
        } else if(isFirefox){
            $(".how-firefox").show();
        } else if(isMSIE){
            $(".how-ie").show();
        }


		//What it is
		$(".what_btn").click(function(e){
			e.preventDefault();
			showWhatItIs($(this).attr("data-target"));
		});

		//Show Select Text Example
		iniSelectTextExample();

		//Show Select Text Example
		$(".Try-Select-Text").click(function(e){
			e.preventDefault();
			$(".how-select-text-ex").show();
			$(".how-select-text-ex .tips-wrapper").css('top', $(window).scrollTop() + 40 + "px");
			$(".how-select-text-ex .example-page").css('top', $(window).scrollTop() + 62 + "px");
			$(window).scroll(function(){
				$(".how-select-text-ex .tips-wrapper").css('top', $(window).scrollTop() + 40 + "px");
				$(".how-select-text-ex .example-page").css('top', $(window).scrollTop() + 62 + "px");
			});
		});

		//Hide Select Text Example
		$(".how-select-text-ex .close-SelectTextEx").click(function(e){
			e.preventDefault();
			$(".how-select-text-ex").hide();
		});

        // go to "How it works" after drag bookmarklet to the top
        $('#how-it-works-remember-button-chrome, #how-it-works-remember-button-safari, #how-it-works-remember-button-firefox, #get-started-remember-button').on("mousedown.bookmarklet", function() {

            // google analytics
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'Bookmarklet', 'Mouse down on bookmarklet ' + $(this).attr('id'), 'Homepage');
            }

            $(window).on("mousemove.bookmarklet", function(e) {
                if (e.pageY < 10) {
                    window.location.hash = "/how-it-works";
                    $(window).off("mousemove.bookmarklet");

                    // google analytics
                    if (typeof ga != 'undefined') {
                        ga('send', 'event', 'Bookmarklet', 'Drag past top of page', 'Homepage');
                    }
                }
            });
        });

        // record video link clicks
        $('#video-link').on("click", function() {

            // google analytics
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'Video', 'Click video link', 'Homepage');
            }
        });


	});

	</script>
{% endblock %}

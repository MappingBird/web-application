{% extends "./share/_layout.swig" %}

{% block ngApp %}SaveApp{% endblock %}

{% block css %}
<!-- xxbuild:css /static/css/style-app.css -->
<link type="text/css" rel="stylesheet" href="/static/css/jquery-ui-themes-1.10.0/base/jquery-ui.css" media="screen">
<link type="text/css" rel="stylesheet" href="/static/css/bootstrap.min.css" media="screen">
<link type="text/css" rel="stylesheet" href="/static/css/bootstrap-responsive.min.css" media="screen">
<link type="text/css" rel="stylesheet" href="/static/css/style.css" media="screen">
<link type="text/css" rel="stylesheet" href="/static/css/maps.css" media="screen">
<link type="text/css" rel="stylesheet" href="/static/css/jquery.mCustomScrollbar.css" media="screen">
<link type="text/css" rel="stylesheet" href="/static/css/ng-tags-input.min.css" media="screen">
<link type="text/css" rel="stylesheet" href="/static/css/slimbox2/slimbox2.css" media="screen">
<!-- endbuild -->
{% endblock %}

{% block prejs %}<script src="https://maps.googleapis.com/maps/api/js?sensor=true&libraries=places"></script>{% endblock %}

{% block content %}
<section ng-controller="savePageController" class="map-section">

    <header ng-controller="userController" class="float-top">
        <a href="/?stay=1" class="logo"></a>
        <div class="navbar pingismo-navbar" ng-show="isLoggedIn">
            <ul class="nav">
                <li class="ver-divider"><span></span></li>
                <li class="dropdown">
                    <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                        <span ng-bind="user.email"></span>
                        <b class="caret"></b>                        </a>
                    <ul class="dropdown-menu pingismo-dropdown-menu">
                        <li><a href="/app#/"><i class="icon-globe"></i> View map</a></li>
                        <li><a href="/settings"><i class="icon-wrench"></i> Settings</a></li>
                        <li class="divider"></li>
                        <li><a id="link-logout" href="#" ng-click="logout($event)"><i class="icon-off"></i> Logout</a></li>
                    </ul>
                </li>
            </ul>
        </div>
        <div class="navbar pingismo-navbar pull-right" ng-show="!isLoggedIn">
            <ul class="nav">
                <li class="signup-button"><button class="btn btn-large btn-primary pingismo-btn" type="button" ng-click="goToSignUpPage()">Sign up</button></li>
                <li class="ver-divider"><span></span></li>
                <li><a href="/login">Login To Your Account</a></li>
            </ul>
        </div>
    </header>

    <!-- Save Panel -->
    <div class="save-panel" ng-controller="searchResultsController" ng-show="showSavePanel" save-panel></div>

    <!-- Collections -->
    <div ng-controller="collectionsController" class="collection-list-wrapper" ng-show="showCollectionList" collection-list></div>
    <!-- End of collections -->

    <!-- Content of Pin -->
    <div ng-controller="pointDetailController" point-detail></div>

    <!-- End of content of pins -->

    <!-- Alert -->
    <div class="top-alert" id="place-saved-alert" p-alert ng-class="{ visible: alertActive }">
        <div class="alert alert-info pingismo-alert">
            <button type="button" class="close" data-dismiss="alert">x</button>
            <i class="icon-check" ></i> <span ng-bind-html="message"></span> <a href="" class="alert-action" ng-bind="actionMessage"></a>
        </div>
    </div>
    <!-- End of alert -->

    <!-- Google maps -->
    <div id="map" ng-class="{retracted: mapRetracted, 'full-tall': fullTallMap, full: fullMap, half: halfMap, 'semi-retracted': semiRetractedMap}" ng-show="mapVisible && !listMode" ng-controller="mapController"></div>
    <!-- End of Google maps -->

    <!-- external map alert -->
    <div class="map-alert" ng-class="{ visible: mapAlertActive }" map-alert>
        <div class="pingismo-pin message-overlay">
            <a href="#" class="pin-misc"></a>
            <div class="message-popup pin-popup">
                <p>
                    <strong ng-bind="mapAlertTitle"></strong>
                    <span ng-bind="mapAlertMessage"></span>
                </p>
            </div>
        </div>
    </div>
    <!-- End of external map alert -->

    <!-- map dialog -->
    <div class="map-dialog" ng-class="{ visible: mapDialogActive }" map-dialog>
        <div class="map-dialog-background">
            <p ng-bind="mapDialogTitle" class="map-dialog-title"></p>
            <p ng-bind="mapDialogMessage" class="map-dialog-message"></p>
            <p class="pull-right">
                <a href="#" class="btn-highlight pingismo-btn" type="button" ng-click="mapDialogAction()" ng-bind="mapDialogButtonLabel"></a>
            </p>
        </div>
    </div>
    <!-- End of map dialog -->

    <!-- List view -->
    <div class="collection-list-view" ng-show="listMode" ng-controller="listController" collection-list-view></div>
    <!-- End of List view -->

    <!-- Massive Alert -->
    <div class="massive-alert" massive-alert>
        <div class="body">
            <h2 class="title">Try entering a name or address to get better results.</h2>
            <p>Before clicking "Remember this place", don't forget to use your mouse to select the name or address of a place in the website you're browsing.<br><br>You can also try entering the name or address of the place in the search bar above and pressing <b>Enter</b>.</p>
            <p><img src="/static/img/tutor-select-text.gif"></p>
        </div>
    </div>
    <!-- End of List view -->

    <div ui-view></div>

    <footer class="narrow">
        <div class="logo-copyright">
            <p>Copyright &copy; 2014 MappingBird LLC. All referred posts &copy; their respective owners.</p>
        </div>
        <div class="lang-contact pull-right">
            <p>
                <a href="mailto:feedback@mappingbird.com" class="footer-contact">Contact Us</a>
                <a href="//www.facebook.com/MappingBird" class="footer-follow" target="_blank">Follow Us</a>
            </p>
        </div>
    </footer>
</section>

{% endblock %}
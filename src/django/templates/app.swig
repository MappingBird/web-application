{% extends "./share/_layout.swig" %}
{% load i18n %}
　
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
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
{% endblock %}

{% block prejs %}<script src="https://maps.googleapis.com/maps/api/js?sensor=true&libraries=places"></script>{% endblock %}

{% block content %}
<section ng-controller="savePageController" class="map-section">

    <header ng-controller="userController" class="float-top">
        <a href="/?stay=1" class="logo"></a>
        <div class="navbar pingismo-navbar" ng-class="{'collection-search-show': isLoggedIn}">
            <ul class="nav">
                <li class="ver-divider"><span></span></li>
                <li class="dropdown">
                    <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                        <span ng-bind="user.email"></span>
                        <b class="caret"></b>                        </a>
                    <ul class="dropdown-menu pingismo-dropdown-menu">
                        <li><a href="/app#/"><i class="icon-globe"></i> {% trans "userPanelViewMap" %}</a></li>
                        <li><a href="/settings"><i class="icon-wrench"></i> {% trans "userPanelSettings" %}</a></li>
                        <li class="divider"></li>
                        <li><a id="link-logout" href="#" ng-click="logout($event)"><i class="icon-off"></i> {% trans "userPanelLogout" %}</a></li>
                    </ul>
                </li>
            </ul>
        </div>
        <div class="navbar pingismo-navbar pull-right" ng-class="{'collection-search-show': !isLoggedIn}">
            <ul class="nav">
                <li class="signup-button"><button class="btn btn-large btn-primary pingismo-btn" type="button" ng-click="goToSignUpPage()">{% trans "userPanelSignup" %}</button></li>
                <li class="ver-divider"><span></span></li>
                <li><a href="/login">{% trans "userPanelLogin" %}</a></li>
            </ul>
        </div>

        <div class="collection-search pull-right" ng-class="{'collection-search-show': isLoggedIn}">
            <input type="text" class="form-control" ng-model="searchContent" placeholder="Search for..." ng-focus="focusSearch($event);" ng-keypress="searchKeypress($event);" >
            <div class="search-icons">
                <span class="search-icon mb-search" ng-show="!focus"><i class="fa fa-search" ng-click="goSearch($event);"></i></span>           
                <span class="search-icon mb-close" ng-show="focus" ng-click="cleanSearch($event);"><i class="fa fa-close"></i></span>
                <span class="search-icon mb-arrow-right" ng-show="focus" ng-click="goSearch($event);"><i class="fa fa-arrow-right"></i></span>
            </div>
        </div><!-- /input-group -->
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
    <div id="map" ng-class="{retracted: mapRetracted, 'full-tall': fullTallMap, full: fullMap, half: halfMap, 'semi-retracted': semiRetractedMap}" ng-show="mapVisible" ng-controller="mapController"></div>
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
    <div class="collection-list-view" ng-show="listMode" ng-class="{ withCollectionList: collectionsMode}" ng-controller="listController" collection-list-view></div>
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
            <p>{% trans "homeFooterCopyright" %}</p>
        </div>
        <div class="lang-contact pull-right">
            <p>
                <a href="mailto:feedback@mappingbird.com" class="footer-contact">{% trans "AccountContactUs" %}</a>
                <a href="//www.facebook.com/MappingBird" class="footer-follow" target="_blank">{% trans "AccountFollow" %}</a>
            </p>
        </div>
    </footer>
</section>

{% endblock %}

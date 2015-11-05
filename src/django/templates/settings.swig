{% extends "./share/_layout.swig" %}
{% load i18n %}

{% block ngApp %}SettingsApp{% endblock %}

{% block css %}
<!-- xxbuild:css /static/css/style-settings.css -->
<link href="/static/prototype_assets/css/bootstrap.min.css" rel="stylesheet" media="screen">
<link href="/static/prototype_assets/css/bootstrap-responsive.min.css" rel="stylesheet" media="screen">
<link href="/static/prototype_assets/css/style.css" rel="stylesheet" media="screen">
<link href="/static/css/account.css" rel="stylesheet" media="screen">

{% endblock %}

{% block content %}
<section class="main" ng-controller="mainController">
    <header>
        <a href="/" class="logo"></a>
        <div class="navbar pingismo-navbar" ng-show="isLoggedIn">
            <ul class="nav">
                <li class="ver-divider"><span></span></li>
                <li class="dropdown">
                    <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                        <span ng-bind="email"></span>
                        <b class="caret"></b>                        </a>
                    <ul class="dropdown-menu pingismo-dropdown-menu">
                        <li><a href="/app#/"><i class="icon-globe"></i> {% trans "userPanelViewMap" %}</a></li>
                        <li><a href="/settings"><i class="icon-wrench"></i> {% trans "userPanelSettings" %}</a></li>
                        <li class="divider"></li>
                        <li><a href="#" ng-click="logout($event)"><i class="icon-off"></i> {% trans "userPanelLogout" %}</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </header>
    <div class="container">
        <div class="row-fluid">
            <div class="span2"></div>
            <div class="span8">
                <p class="title">[[email]]</p>
                <h1>{% trans "AccountSettings" %}</h1>
                <hr>
                <p class="title">{% trans "AccountSettingsChangePassword" %}</p>
                <form ng-submit="checkInput()">
                    <div class="control-group" ng-class="{ 'control-group' : 1, 'error' : errorOldPasswordIncorrect }">
                        <input type="password" placeholder="Old Password" name="old_password" ng-model="old_password" required />
                    </div>
                    <div class="error-message control-group" ng-class="{ 'error-message' : 1, 'control-group' : 1, 'error' : errorOldPasswordIncorrect }" ng-show="errorOldPasswordIncorrect">
                        <p class="help-inline">{% trans "AccountSettingsPassIncorrect" %}</p>
                    </div>

                    <div class="control-group" ng-class="{ 'control-group' : 1, 'error' : errorPasswordTooShort || errorOldPasswordNewPasswordSame }">
                        <input type="password" placeholder="New Password" name="new_password" ng-model="new_password" required />
                    </div>
                    <div class="error-message control-group" ng-class="{ 'error-message' : 1, 'control-group' : 1, 'error' : errorOldPasswordNewPasswordSame }" ng-show="errorOldPasswordNewPasswordSame">
                        <p class="help-inline">{% trans "AccountSettingsPassCantSame" %}</p>
                    </div>
                    <div class="error-message control-group" ng-class="{ 'error-message' : 1, 'control-group' : 1, 'error' : errorPasswordTooShort }" ng-show="errorPasswordTooShort">
                        <p class="help-inline">{% trans "AccountSettingsPassTooShort" %}</p>
                    </div>

                    <div class="control-group" ng-class="{ 'control-group' : 1, 'error' : errorNewPasswordsNoMatch }">
                        <input type="password" placeholder="Confirm Password" name="confirm_password" ng-model="confirm_password" required />
                    </div>
                    <div class="error-message control-group" ng-class="{ 'error-message' : 1, 'control-group' : 1, 'error' : errorNewPasswordsNoMatch }" ng-show="errorNewPasswordsNoMatch">
                        <p class="help-inline">{% trans "AccountSettingsPassDontMatch" %}</p>
                    </div>
                    <div class="control-group" ng-show="passwordChanged">
                        <p class="help-inline">{% trans "AccountSettingsPassChangeSuccess" %}</p>
                    </div>
                    <div class="action-button">
                        <input class="btn btn-primary pingismo-btn" type="submit" value="Update Password">
                    </div>
                </form>

                <!-- <div ng-show="false">
                    <hr>
                    <p class="title">Delete Account</p>
                    <p class="error">Once you delete your account, all of your saved points will be deleted. There is no way to recover your deleted data. Are you sure you want to do this?</p>
                    <div class="action-button">
                        <a href="" ng-click="" class="btn btn-primary pingismo-btn">Delete Account</a>
                    </div>
                </div> -->
            </div>
            <div class="span2"></div>
        </div>
    </div>
    <footer>
        <div class="logo-copyright">
            <p class="slogan"><img src="/static/img/logo-footer.png" /> {% trans "homeFooterSlogan" %}</p>
            <p>{% trans "homeFooterCopyright" %}</p>
        </div>
        <div class="lang-contact pull-right">
            <ul class="nav nav-pills">
                <li><a href="#" change-language='zh-tw'>繁體中文</a></li>
                <li class="divider-vertical pingismo-divider-vertical"></li>
                <li class="active"><a href="#" change-language='en'>English</a></li>
            </ul>
            <p>
                <a href="mailto:feedback@mappingbird.com" class="footer-contact">{% trans "AccountContactUs" %}</a>
                <a href="//www.facebook.com/MappingBird" class="footer-follow" target="_blank">{% trans "AccountFollow" %}</a>
            </p>
        </div>
    </footer>
</section>
{% endblock %}

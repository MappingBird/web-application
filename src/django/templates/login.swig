{% extends "./share/_layout.swig" %}
{% load i18n %}

{% block ngApp %}LoginApp{% endblock %}

{% block css %}
<!-- xxbuild:css /static/css/style-login.css -->
<link href="/static/css/bootstrap.min.css" rel="stylesheet" media="screen">
<link href="/static/css/bootstrap-responsive.min.css" rel="stylesheet" media="screen">
<link href="/static/prototype_assets/css/style.css" rel="stylesheet" media="screen">
<link href="/static/css/account.css" rel="stylesheet" media="screen">
<style type="text/css">
    footer {
        position: relative;
    }
</style>

{% endblock %}

{% block content %}
<section class="main" ng-controller="mainController">
    <header>
        <a href="/" class="logo"></a>
    </header>
    <div class="container">
        <div class="row-fluid">
            <div class="span2"></div>
            <div class="span8">
                <h1>Log In</h1>
                <hr>
                <p class="title">{% trans "AccountLogin" %}</p>
                <div class="myButton" ng-click="attemptFBLogin();">
                    <i class="fa fa-facebook"></i>
                    <span>Log in with Facebook</span>
                </div>
                <hr class="or-style">
                <form ng-submit="checkInput()">
                    <div class="control-group">
                        <input type="text" placeholder="Email" ng-model="email" autofocus />
                    </div>
                    <div class="control-group">
                        <input type="password" placeholder="Password" ng-model="password" />
                    </div>
                    <div class="error-message control-group" ng-class="{'error' : errorInvalidLogin }" ng-show="errorInvalidLogin" id="error">
                        <p class="help-inline">{% trans "AccountLoginFailed" %}</p>
                    </div>
                    <div>
                        <a href="#">{% trans "AccountForget" %}</a>
                    </div>
                    <div class="action-button">
                        <button class="btn btn-giant btn-primary pingismo-btn" type="submit" id="login-button"> {% trans "AccountLoginBtn" %}</button>
                        <p class="button-option">{% trans "AccountNotMember" %} <a href="/signup">{% trans "AccountSignupnow" %}</a></p>
                    </div>

                    {# <fb:login-button scope="public_profile,email" onlogin="checkLoginState();"></fb:login-button> #}
                    {# <div id="status"></div> #}

                </form>
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

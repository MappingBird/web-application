{% extends "./share/_layout.swig" %}

{% block ngApp %}LoginApp{% endblock %}

{% block css %}
<!-- xxbuild:css /static/css/style-login.css -->
<link href="/static/css/bootstrap.min.css" rel="stylesheet" media="screen">
<link href="/static/css/bootstrap-responsive.min.css" rel="stylesheet" media="screen">
<link href="/static/prototype_assets/css/style.css" rel="stylesheet" media="screen">
<link href="/static/css/account.css" rel="stylesheet" media="screen">

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
                <h1>MappingBird</h1>
                <hr>
                <p class="title">Login</p>
                <form ng-submit="checkInput()">
                    <div class="control-group">
                        <input type="text" placeholder="Email" ng-model="email" autofocus />
                    </div>
                    <div class="control-group">
                        <input type="password" placeholder="Password" ng-model="password" />
                    </div>
                    <div class="error-message control-group" ng-class="{'error' : errorInvalidLogin }" ng-show="errorInvalidLogin" id="error">
                        <p class="help-inline">Invalid ID or password! Please try again.</p>
                    </div>
                    <div>
                        <a href="#">Forgot your password?</a>
                    </div>
                    <div class="action-button">
                        <button class="btn btn-giant btn-primary pingismo-btn" type="submit" id="login-button">Login to Your Account</button>
                        <p class="button-option">Not a member? <a href="/signup">Sign up now</a></p>
                    </div>
                </form>
            </div>
            <div class="span2"></div>
        </div>
    </div>
    <footer>
        <div class="logo-copyright">
            <p class="slogan"><img src="/static/img/logo-footer.png" /> Remember places for later.</p>
            <p>Copyright &copy; 2015 MappinBird LLC. All referred posts &copy; their respective owners.</p>
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
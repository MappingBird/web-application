{% extends "./share/_layout.swig" %}

{% block ngApp %}SignupApp{% endblock %}

{% block css %}
<!-- xxbuild:css /static/css/style-signup.css -->
<link href="/static/prototype_assets/css/bootstrap.min.css" rel="stylesheet" media="screen">
<link href="/static/prototype_assets/css/bootstrap-responsive.min.css" rel="stylesheet" media="screen">
<link href="/static/prototype_assets/css/style.css" rel="stylesheet" media="screen">
<link href="/static/css/account.css" rel="stylesheet" media="screen">
<!-- endbuild -->
{% endblock %}

{% block content %}
<section class="main" ng-controller="mainController">
    <header>
        <a href="/" class="logo"></a>
        <div class="navbar pingismo-navbar" id="account-menu"></div>
    </header>
    <div class="container" ng-hide="accountCreated">
        <div class="row-fluid">
            <div class="span2"></div>
            <div class="span8">
                <h1>MappingBird</h1>
                <hr>
                <p class="title">Sign up</p>
                <form ng-submit="checkInput()">
                    <div class="control-group">
                        <input type="email" placeholder="Email address" name="email" ng-model="email" required autofocus />
                    </div>
                    <div class="control-group" ng-class="{ 'control-group' : 1, 'error' : errorPasswordTooShort }">
                        <input type="password" placeholder="Password" name="password" ng-model="password" required />
                    </div>
                    <div class="error-message control-group" ng-class="{ 'error-message' : 1, 'control-group' : 1, 'error' : errorPasswordTooShort }" ng-show="errorPasswordTooShort">
                        <p class="help-inline">Password is too short.</p>
                    </div>
                    <div class="error-message control-group" ng-class="{ 'error-message' : 1, 'control-group' : 1, 'error' : errorEmailAlreadyRegistered }" ng-show="errorEmailAlreadyRegistered">
                        <p class="help-inline">The email has been used. <a href="/login" target="_self">Already has account?</a></p>
                    </div>

                    <div>
                        By creating an account, I accept MappingBird's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                    </div>
                    <div class="action-button">
                        <input class="btn btn-giant btn-primary pingismo-btn" type="submit" value="Create Your Account">
                    </div>
                </form>
            </div>
            <div class="span2"></div>
        </div>
    </div>
    <div id="container-account-created" class="container" ng-show="accountCreated">
        <div class="row-fluid">
            <div class="span2"></div>
            <div class="span8">
                <h1>MappingBird</h1>
                <hr>
                <p class="title">
                    <span><img src="/static/img/smile.png" /></span>
                    Account created!
                </p>
                <form>
                    <div>
                        <p class="fresh">Congratulations! You are now able to create your own map and save places you love. Click "<strong>Get Started</strong>" to learn how it works.</p>
                        <p class="saved">Congratulations! Your account has been created. Click "<strong>View Map</strong>" to see your own map and the places you just saved.</p>
                    </div>
                    <div class="action-button">
                        <a class="btn-highlight pingismo-btn" href="/">Get Started</a>
                    </div>
                </form>
            </div>
            <div class="span2"></div>
        </div>
    </div>
    <footer>
        <div class="logo-copyright">
            <p class="slogan"><img src="/static/img/logo-footer.png" /> Remember places for later.</p>
            <p>Copyright &copy; 2015 MappingBird LLC. All referred posts &copy; their respective owners.</p>
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

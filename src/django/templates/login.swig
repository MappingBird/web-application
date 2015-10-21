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

      <script>
      // This is called with the results from from FB.getLoginStatus().
      function statusChangeCallback(response) {
        console.log('statusChangeCallback');
        console.log(response);
        // The response object is returned with a status field that lets the
        // app know the current login status of the person.
        // Full docs on the response object can be found in the documentation
        // for FB.getLoginStatus().
        if (response.status === 'connected') {
          // Logged into your app and Facebook.
          testAPI();
        } else if (response.status === 'not_authorized') {
          // The person is logged into Facebook, but not your app.
          document.getElementById('status').innerHTML = 'Please log ' +
            'into this app.';
        } else {
          // The person is not logged into Facebook, so we're not sure if
          // they are logged into this app or not.
          document.getElementById('status').innerHTML = 'Please log ' +
            'into Facebook.';
        }
      }

      // This function is called when someone finishes with the Login
      // Button.  See the onlogin handler attached to it in the sample
      // code below.
      function checkLoginState() {
        FB.getLoginStatus(function(response) {
          statusChangeCallback(response);
        });
      }

      window.fbAsyncInit = function() {
      FB.init({
        appId      : '990855437627828',
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.2' // use version 2.2
      });

      // Now that we've initialized the JavaScript SDK, we call
      // FB.getLoginStatus().  This function gets the state of the
      // person visiting this page and can return one of three states to
      // the callback you provide.  They can be:
      //
      // 1. Logged into your app ('connected')
      // 2. Logged into Facebook, but not your app ('not_authorized')
      // 3. Not logged into Facebook and can't tell if they are logged into
      //    your app or not.
      //
      // These three cases are handled in the callback function.

      FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
      });

      };

      // Load the SDK asynchronously
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));

      // Here we run a very simple test of the Graph API after login is
      // successful.  See statusChangeCallback() for when this call is made.
      function testAPI() {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
          console.log('Successful login for: ' + response.name);
          document.getElementById('status').innerHTML =
            'Thanks for logging in, ' + response.name + '!';
        });
      }
    </script>

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

                    <fb:login-button scope="public_profile,email" onlogin="checkLoginState();">
                    </fb:login-button>

                    <div id="status">
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
                <!-- <li><a href="#">繁體中文</a></li>
                <li class="divider-vertical pingismo-divider-vertical"></li> -->
                <li class="active"><a href="#">English</a></li>
            </ul>
            <p>
                <a href="mailto:feedback@mappingbird.com" class="footer-contact">Contact Us</a>
                <a href="//www.facebook.com/MappingBird" class="footer-follow" target="_blank">Follow Us</a>
            </p>
        </div>
    </footer>
</section>
{% endblock %}

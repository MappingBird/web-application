<!DOCTYPE html>
<html>
<head>

    <title>MappingBird - Remember places for later</title>

    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta name="author" content="MappingBird"/>
    <meta name="title" content="MappingBird"/>
    <meta name="description" content="Remember places for later"/>
    <meta name="keywords" content="MappingBird, Mapping Bird, travel, travels, planning, travel planning, save for later, bookmark, bookmarks, bookmarking, bookmark place, bookmark places, review, reviews, popular, plan, map, maps, attractions, advice, restaurants, iphone, app, offline, ipad, android, kindle, firefox, extension, note taking, note taking software, notes, remember, memory assistant, personal memory assistant"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, minimal-ui">
    <meta name="google-site-verification" content="2jDqeNwDYc2gLlaivjMppxDcIXBQ2UIM4UxhVGkDAkY" />

    <link rel="apple-touch-icon" href="/static/img/apple-touch-icon.png">
    <link rel="icon" type="image/png" href="/static/favicon.ico" />
    <link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/ipjijcfmgfehpiiigjgjdgkldeligkfo">
    <link rel="stylesheet" type="text/css" href="//maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">
    {% block css %}{% endblock %}

</head>
<body ng-app="{% block ngApp %}{% endblock %}">
{% block content %}{% endblock %}

{% block prejs %}{% endblock %}
{% include "share/_js.swig" %}
{% block postjs %}{% endblock %}
<script>
function fb_login(){
FB.login(function(response) {

    if (response.authResponse) {
        console.log('Welcome!  Fetching your information.... ');
        //console.log(response); // dump complete info
        access_token = response.authResponse.accessToken; //get access token
        user_id = response.authResponse.userID; //get FB UID

        FB.api('/me', function(response) {
            user_email = response.email; //get user email
      // you can store this data into your database             
        });

    } else {
        //user hit cancel button
        console.log('User cancelled login or did not fully authorize.');

    }
}, {
    scope: 'public_profile,email'
});
}
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
</body>
</html>

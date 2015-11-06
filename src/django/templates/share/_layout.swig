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
window.fbAsyncInit = function() {
    FB.init({
        appId      : '990855437627828',
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.2' // use version 2.2
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
</script>

</body>
</html>

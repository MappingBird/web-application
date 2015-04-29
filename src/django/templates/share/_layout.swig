<!DOCTYPE html>
<html ng-app="{% block ngApp %}{% endblock %}">
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
    <meta name="google-site-verification" content="ErXr9MhG9VBmYbFr042r2wLOWXfXEii_p8IC6VbgxbE" />

    <link rel="apple-touch-icon" href="/static/img/apple-touch-icon.png">
    <link rel="icon" type="image/png" href="/static/favicon.ico" />
    <link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/ipjijcfmgfehpiiigjgjdgkldeligkfo">
    {% block css %}{% endblock %}

</head>
<body>
{% block content %}{% endblock %}

{% block prejs %}{% endblock %}
{% include "share/_js.swig" %}
{% block postjs %}{% endblock %}

</body>
</html>

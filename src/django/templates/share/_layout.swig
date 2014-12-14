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
    <meta name="keywords" content=""/>
    <meta name="viewport" content="width=device-width, initial-scale=1, minimal-ui">

    <link rel="apple-touch-icon" href="/static/img/apple-touch-icon.png">
    <link rel="icon" type="image/png" href="/static/favicon.ico" />

    {% block css %}{% endblock %}

</head>
<body>
{% block content %}{% endblock %}

{% block prejs %}{% endblock %}
{% include "share/_js.swig" %}
{% block postjs %}{% endblock %}

</body>
</html>
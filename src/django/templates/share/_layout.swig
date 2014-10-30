<!DOCTYPE html>
<html ng-app="{% block ngApp %}{% endblock %}">
<head>
    <title>MappingBird - Remember places for later</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    {% block css %}{% endblock %}

</head>
<body>
{% block content %}{% endblock %}

{% block prejs %}{% endblock %}
{% include "share/_js.swig" %}
{% block postjs %}{% endblock %}

</body>
</html>

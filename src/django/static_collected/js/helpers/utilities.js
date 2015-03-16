(function () {
    mappingbird.utilities = angular.module('mappingbird.utilities', [])
        .provider('Utility', function Utility() {

            var $injector;

            this.setupUtilities = function (injector) {
                $injector = injector;
            };

            // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values/901144
            this.getParameterByName = function (name) {
                name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

                var regexS = "[\\?&]" + name + "=([^&#]*)",
                    regex = new RegExp(regexS),
                    results = regex.exec(window.location.search);

                return (results === null) ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            };

            // http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
            this.isNumber = function (n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
            };

            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
            this.getRandomInt = function (min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            };

            // http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
            this.arraysAreEqual = function (array1, array2) {
                // if the other array is a falsy value, return
                if (!array1 || !array2)
                    return false;

                // compare lengths - can save a lot of time
                if (array1.length != array2.length)
                    return false;

                for (var i = 0; i < array1.length; i++) {
                    // Check if we have nested arrays
                    if (array1[i] instanceof Array && array2[i] instanceof Array) {
                        // recurse into the nested arrays
                        if (!this.arraysAreEqual(array1[i], array2[i]))
                            return false;
                    }
                    else if (array1[i] != array2[i]) {
                        // Warning - two different object instances will never be equal: {x:20} != {x:20}
                        return false;
                    }
                }
                return true;
            };

            this.$get = ["$injector", function (injector) {

                this.setupUtilities(injector);

                return {
                    getParameterByName: this.getParameterByName,
                    isNumber: this.isNumber,
                    getRandomInt: this.getRandomInt,
                    arraysAreEqual: this.arraysAreEqual
                };
            }];
        });
})();
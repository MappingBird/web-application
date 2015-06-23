mappingbird.SaveApp.controller('listController', ['$scope', 'Presets', 'MapPoints', 'BroadcastService', '$state', '$timeout', function($scope, Presets, MapPoints, BroadcastService, $state, $timeout) {

    $scope.$watch(function() { return MapPoints.activeViewPoints; }, function(activeViewPoints) {

        console.log('MapPoints.activeViewPoints changed');
        console.log($scope.activeViewPoints);
        console.log(activeViewPoints);

        if (!angular.equals($scope.activeViewPoints, activeViewPoints)) {
            $scope.activeViewPoints = activeViewPoints;
        }
    });


    $scope.$on('stateChange', function() {
        console.log ('[[[stateChange listController]]]');
        console.log (BroadcastService.message.type);
        switch (BroadcastService.message.type) {
            case 'listMode':
                break;
        }
    });

    $scope.popupPin = function (e, id) {
      e.preventDefault();
      var idName = 'pin-' + id;

      $('#' + idName).trigger('click');
    };
}]);

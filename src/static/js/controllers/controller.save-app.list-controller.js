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
      $('.pingismo-pin').removeClass('active'); // remove popup style first

      var idName = 'pin-' + id;
      $('#' + idName + ' > a').trigger('click');
    };

    $scope.offsetMapWhenHover = function (e, id, lat, lng) {
      e.preventDefault();

      BroadcastService.prepForBroadcast({
          type: 'offsetCenterWhenListview',
          data: {
            id: id,
            lat: lat,
            lng: lng
          }
      });
    };

}]);

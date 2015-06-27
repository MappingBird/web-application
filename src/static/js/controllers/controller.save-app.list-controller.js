mappingbird.SaveApp.controller('listController', ['$scope', 'Presets', 'MapPoints', 'BroadcastService', '$state', '$timeout', function($scope, Presets, MapPoints, BroadcastService, $state, $timeout) {

    $scope.$watch(function() { return MapPoints.activeViewPoints; }, function(activeViewPoints) {

        console.log('MapPoints.activeViewPoints changed');
        console.log($scope.activeViewPoints);
        console.log(activeViewPoints);

        // list create time descending
        activeViewPoints.sort(function (a,b) { return a.create_time > b.create_time ? 0 : 1 });

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

    var clickId = null;
    $scope.popupPin = function (e, id) {
      e.preventDefault();

      if (id == clickId) {
        return;
      }
      $scope.isSelected = id; // toggle isSelected class

      $('#pin-' + id).removeClass('active'); // remove popup style first

      var idName = 'pin-' + id;
      $('#' + idName + ' > a').trigger('click');

      // prepare for next time click popup
      clickId = id;
    };

    var hoverId = null;
    $scope.offsetMapWhenHover = function (e, id, lat, lng) {
      e.preventDefault();

      BroadcastService.prepForBroadcast({
          type: 'offsetCenterWhenListview',
          data: {
            oldId: hoverId,
            id: id,
            lat: lat,
            lng: lng
          }
      });

      // prepare for next time
      hoverId = id;
    };

}]);

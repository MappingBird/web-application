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
            case 'selectListByPoint':
              $timeout(function () {
                selectListByPoint(BroadcastService.message.data.id);
              });
              break;
        }
    });

    var clickId = null;
    $scope.popupPin = function (e, id) {
      console.log('popupPin', id, clickId);
      e.preventDefault();

      if (clickId && id == clickId) {
        console.log('repeated click');
        return;
      }
      $scope.isSelected = id; // toggle isSelected class

      var idName = 'pin-' + id;
      $('#' + idName).removeClass('active'); // remove popup style first
      $('#' + idName + ' > a').trigger('click');

      // prepare for next time click popup
      clickId = id;
      if (hoverId && clickId == hoverId) {
        hoverId = null;
      }
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
      if (clickId && id == clickId) {
        hoverId = null;
      } else {
        hoverId = id;
      }

    };

    /*
     In listview mode,
     when user select the point,
     trigger the listview change
    */
    var selectListByPoint = function (id) {
      // unselect
      if (id == $scope.isSelected) {
        hoverId = null;
        clickId = null;
        $scope.isSelected = null;
      } else {
        // select
        $scope.isSelected = id;
        clickId = id;
        hoverId = id;

        // scroll listview
        $('.collection-listview').mCustomScrollbar('scrollTo', '#list-' + id,{scrollInertia: 300});
      }

    };

}]);

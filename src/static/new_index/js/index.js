angular.module('IndexApp', ['ui.bootstrap']);

//Carousel: This is for "How It Works" to teach users how to use MappingBird step-by-step
angular.module('IndexApp').controller('CarouselDemoCtrl', function ($scope) {
  $scope.myInterval = 0;
  var slides = $scope.slides = [];
  $scope.addSlide = function() {
    var newWidth = slides.length + 1;
    slides.push({
      image: '/static/new_index/images/howitworks_' + newWidth + '.png',
      title: ['1. Install the MappingBird Button',
              '2. Find Places From Your Favorite Websites',
              '3. Hightlight the Name or Address and Click',
              '4. Confirm, and Finish'],
      text:  ['Click the "READY TO GO" button to install the MappingBird browser button for the best way to bookmark places.',
              'Browse the web as usual, but when you find a place you want to save...',
              'Once you\'ve found a place you want to save, highlight (text-select) the name or address of the place, and then click the MappingBird button you just installed.',
              'Confirm the place or address, click "Go" and the place will be saved to MappingBird!']
    });
  };
  for (var i=0; i<4; i++) {
    $scope.addSlide();
  }
});

//Modal: A popup dialog for asking visiters' email
angular.module('IndexApp').controller('ModalDemoCtrl', function ($scope, $modal, $log) {

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.open = function (size) {

    var modalInstance = $modal.open({
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.getStarted = function () {

    // not chrome
    var isChrome = /Chrome/.test(navigator.userAgent) || /crios/.test(navigator.vendor);
    if (isChrome) {
      location.href = '/signup';
    } else {
      var modalInstance = $modal.open({
        templateUrl: 'myModalContent2.html',
        controller: 'ModalInstanceCtrl',
        resolve: {
          items: function () {
            return $scope.items;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    }
  };
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('IndexApp').controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function (id) {
    var email = $('#' + id).val();
    // test email regular expression
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(email)) {
      return false;
    }

    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

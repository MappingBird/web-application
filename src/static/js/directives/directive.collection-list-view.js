/**
 * MappingBird Directive
 * Collection List View
 */
mappingbird.directives.directive('collectionListView', function() {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/static/partials/collection_list_view.html',
        replace: false,
        controller: ['$scope', '$element', '$attrs', 'BroadcastService', '$window', function($scope, $element, $attrs, BroadcastService, $window) {
			var tmpList = [];

			for (var i = 1; i <= 6; i++){
				tmpList.push({
				  text: 'Item ' + i,
				  value: i
				});
			}

			$scope.list = tmpList;


			$scope.sortingLog = [];
			// $scope.sortableOptions = {
			//   update: function(e, ui) {
			//     if (ui.item.sortable.model == "can't be moved") {
			//       ui.item.sortable.cancel();
			//     }
			//   }
			// };

			// $("#sortable").mCustomScrollbar({
			// 	scrollbarPosition:"outside",
			// 	scrollInertia: 0,
			// 	theme:"light-2"
			// });
							
			// $("#sortable ul").sortable({
			// 	axis:"y",
			// 	cursor:"move",
			// 	tolerance:"intersect",
			// 	change:function(e,ui){
			// 		var h=ui.helper.outerHeight(true),
			// 			elem=$("#sortable .mCustomScrollBox"),
			// 			elemHeight=elem.height(),
			// 			moveBy=$("#sortable li").outerHeight(true)*3,
			// 			mouseCoordsY=e.pageY-elem.offset().top;
			// 		if(mouseCoordsY<h){
			// 			$("#sortable").mCustomScrollbar("scrollTo","+="+moveBy);
			// 		}else if(mouseCoordsY>elemHeight-h){
			// 			$("#sortable").mCustomScrollbar("scrollTo","-="+moveBy);
			// 		}
			// 	}
			// });
			$scope.sortableOptions = {
				axis:"y",
				cursor:"move",
				tolerance:"intersect",
				change:function(e,ui){
					var h=ui.helper.outerHeight(true),
						elem=$("#sortable .mCustomScrollBox"),
						elemHeight=elem.height(),
						moveBy=$("#sortable li").outerHeight(true)*3,
						mouseCoordsY=e.pageY-elem.offset().top;
					if(mouseCoordsY<h){
						$("#sortable").mCustomScrollbar("scrollTo","+="+moveBy);
					}else if(mouseCoordsY>elemHeight-h){
						$("#sortable").mCustomScrollbar("scrollTo","-="+moveBy);
					}
				}
			};	
        }]
    };
});
/** DIRECTIVES **/
// general repeat event
var directives = angular.module('SaveApp.directives', []);

directives.directive("onRepeatDone", [ '$compile', function($compile) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs ) {
            if (scope.$last) {
                console.log('onRepeatDone last');
                scope.$emit(attrs["onRepeatDone"] || "repeat_done", element);
            }
        }
    }
}]);

// scrollbar height to bottom
directives.directive('scrollbarHeightToBottom', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: function($scope, $element, $attrs, BroadcastService) {
            // DIRTY HACK
            var height;

            // DIRTY DIRTY HACK
            // but in the interest of time...
            height = $('body').height() - 300;

            $element.css('max-height', height + 'px');

        }
    };
});

// height to bottom
directives.directive('heightToBottom', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: function($scope, $element, $attrs, BroadcastService) {
            // DIRTY HACK
            var tolerance = 0, // pixels
                outer_parent = $element.parent().parent().parent(),
                offset,
                padding,
                footer,
                height;

            // DIRTY DIRTY HACK
            // but in the interest of time...
            height = $('body').height() - 305;

            $element.css('height', height + 'px');

            /*
            $scope.$on('stateChange', function () {
                if (BroadcastService.message.type == 'pointLoaded') {

                    offset = $element.position();
                    padding = parseInt($element.parent().parent().css('padding-bottom').replace('px', ''), 10);
                    footer = $(outer_parent.find('.pin-content-footer')[0]).height();
                    height = outer_parent.height() - offset.top - padding - footer - tolerance;

                    $element.css('height', height + 'px');
                }
            } );
            */
        }
    };
});

// left outer height
directives.directive('leftOuterHeight', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: function($scope, $element, $attrs, BroadcastService) {
            // DIRTY HACK
            var tolerance = 60; // pixels
            var height = $($('body')[0]).height() - $($('header')[0]).height() - $($('footer')[0]).height() - tolerance;
            $element.css('height', height + 'px');
        }
    };
});

// mCustomScrollbar parent
directives.directive('mCustomScrollbarParent', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: function($scope, $element, $attrs, BroadcastService) {
            // DIRTY HACK
            var tolerance = 35; // pixels
            var height = $($('body')[0]).height() - $($('header')[0]).height() - $($('.collection-wrapper')[0]).height() - $($('footer')[0]).height() - tolerance;
            console.log('mCustomScrollbarParent height: ' + height);
            $element.css('height', height + 'px');
            $element.find('[m-custom-scrollbar]').attr('parent-height', height);
        }
    };
});

// mCustomScrollbar
directives.directive('mCustomScrollbar', function() {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {

            var scrollbarAttrs = scope.$eval(attrs.mCustomScrollbar),
                triggerEvent = scrollbarAttrs.triggerEvent;

            scope.$on(triggerEvent, function () {
                console.log('trigger mCustomScrollbar');
                if (element.attr('parent-height')) {
                    element.css('height', element.attr('parent-height') + 'px');
                }

                if (!$(element).hasClass('mCustomScrollbar')) {
                    $(element).mCustomScrollbar(scrollbarAttrs);
                }
            } );
        }
    };
});

// searchbar
directives.directive('searchBox', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: function($scope, $element, $attrs, BroadcastService) {

            $scope.$on('stateChange', function () {
                if (typeof BroadcastService.message == 'object'
                    && BroadcastService.message.type == 'noSearchQuery') {
                    $($element).attr({'placeholder': 'Name or address of a place'});
                }
            } );
        }
    };
});

// alert
directives.directive('pAlert', function(BroadcastService, $timeout, $sce) {
    return {
        restrict: 'A',
        link: function($scope, $elem, $attrs) {
            $elem.find('.close').on('click', function(e) {
                $elem.hide();
            });
        },
        controller: function($scope, $element, $attrs, BroadcastService, $sce) {

            $scope.alertActive = false;

            $scope.$on('stateChange', function() {
                if (typeof BroadcastService.message == 'object') {
                    switch (BroadcastService.message.type) {
                        case 'pointSaveComplete':

                            $scope.alertActive = true;
                            $scope.message = $sce.trustAsHtml('A new place was saved to <strong>' + BroadcastService.message.data.savedCollectionName + '</strong> successfully. :)');
                            $scope.actionMessage = '';

                            $timeout(function(){
                                $element.hide();
                            }, 3000);
                            break;

                        case 'pointDeleted':

                            $scope.alertActive = true;
                            $scope.message = $sce.trustAsHtml('Point deleted successfully.');
                            $scope.actionMessage = '';

                            $timeout(function(){
                                $element.hide();
                            }, 3000);
                            break;

                        case 'requestDeleteCollection':

                            $scope.alertActive = true;
                            $scope.message = $sce.trustAsHtml('<strong>' + BroadcastService.message.data.collectionToBeDeletedName + '</strong> is being deleted.');
                            $scope.actionMessage = 'Undo';

                            var timer = $timeout(function(){
                                $element.hide();
                                BroadcastService.prepForBroadcast({
                                    type: 'deleteCollection',
                                    data: {
                                        id: BroadcastService.message.data.collectionToBeDeletedId
                                    }
                                });
                            }, 4000);

                            $element.find('.alert-action').on('click', function(e){
                                e.preventDefault();
                                e.stopPropagation();
                                $timeout.cancel(timer);
                                $(this).off('click');
                                $element.hide();
                            });

                            break;

                    }
                }
            });

        },
        replace: false
    };
});

// show collection list view
directives.directive('collectionListView', function() {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/static/js/save-app/templates/partials/collection_list_view.html',
        replace: false
    };
});

// show save panel
directives.directive('savePanel', function() {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/static/js/save-app/templates/partials/save_panel.html',
        replace: false
    };
});

// show point detail
directives.directive('pointDetail', function() {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/static/js/save-app/templates/partials/point_detail.html',
        replace: false
    };
});

// show collection list
directives.directive('collectionList', function() {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/static/js/save-app/templates/partials/collection_list.html',
        replace: false
    };
});

// open url in new window
directives.directive('newWindow', function() {
    return {
        restrict: 'A',
        link: function($scope, $elem, $attrs) {
            $elem.on('click', function(e) {
                e.preventDefault();
                window.open($attrs['href'], '_blank');
            });
        },
        replace: false
    };
});

// process thumbs for display in save panel
directives.directive('thumbAlignment', function($compile){
    return {
        restrict: 'A',
        scope: true,
        replace: false,
        template: '<div class="photo-obj"></div><div id="picstest"></div>',
        controller: function($scope, $element, $attrs, BroadcastService){

            var config = $scope.$eval($attrs.thumbAlignment),
                displayArray = config.displayArray,
                selectArray = config.selectArray,
                deselectArray = config.deselectArray,
                onlyFirstSelected = config.onlyFirstSelected,
                whiteBackground = config.whiteBackground,
                photo_array = null, //photo.js
                lastWidth = 0, // photo.js
                picPhotoObj = $($($element).find(".photo-obj")[0]), // photo.js
                picContainer = $($element), // photo.js
                editMode = config.editMode || false,
                enableLightbox = config.enableLightbox || false,
                picRow //photo.js
                ;

            // photo.js
            function processPhotos(photos, lastWidth) {

                console.log('processPhotos');
                // get row width - this is fixed.
                var w = picRow.innerWidth(),
                    h = 180, // initial height - effectively the maximum height +/- 10%;
                    border = 2, // margin width
                    ws = [],
                    baseLine = 0, // total number of images appearing in all previous rows
                    rowNum = 0,
                    n = 0, // index for photo's id
                    c = 0, // number of images appearing in this row
                    numPhotos = photos.length,
                    d_row,
                    photo
                    ;

                console.log('lastWidth: ' + lastWidth);
                console.log('innerwidth: ' + w);
                console.log('numPhotos: ' + numPhotos);

                // store relative widths of all images (scaled to match estimate height above)
                $.each(photos, function(key, val) {
                    var wt = parseInt(val.width, 10),
                        ht = parseInt(val.height, 10);
                    if( ht != h ) { wt = Math.floor(wt * (h / ht)); }
                    ws.push(wt);
                });

                // show loading animation
                picContainer.addClass('loading-images');

                while (baseLine < numPhotos) {

                    rowNum++;

                    // add a div to contain images
                    d_row = $("<div class='picrow'></div>");
                    // white background?
                    if (whiteBackground) {
                        d_row.addClass('white');
                    }
                    picContainer.append(d_row);
                    d_row.width(lastWidth);
                    d_row.empty();

                    c = 0;

                    // total width of images in this row - including margins
                    var tw = 0;

                    var currIndex = 0;

                    // calculate width of images and number of images to view in this row.
                    while( tw * 1.1 < w)
                    {
                        currIndex = baseLine + c++;
                        if(currIndex == numPhotos) {break;}
                        tw += ws[currIndex] + border * 2;
                    }
                    // Ratio of actual width of row to total width of images to be used.
                    var r = w / tw;
                    // image number being processed
                    var i = 0;
                    // reset total width to be total width of processed images
                    tw = 0;

                    // new height is not original height * ratio
                    var ht = (Math.floor(h * r) < (h * 1.1))?Math.floor(h * r) : (h * 1.1);
                    while( i < c )
                    {
                        photo = photos[baseLine + i];
                        // Calculate new width based on ratio
                        if(photo){
                            var wt = (ht == (h * 1.1))?Math.floor(parseInt(photos[baseLine + i].width,10) * (h * 1.1) / parseInt(photos[baseLine + i].height, 10)):Math.floor(ws[baseLine + i] * r);

                            // add to total width with margins
                            tw += wt + border * 2;
                            // Create image, set src, width, height and margin
                            (function() {
                                var url = photo.src,
                                    token = Math.floor(Math.random() * 10 + 1), // url ? url.substring(url.lastIndexOf("/") + 1) :
                                    cl = "", // image class
                                    img_id = n + "_" + token,
                                    img = $('<img/>',{'class': "photo", src: url, width: wt}),
                                    // Add Check icon on top of selected image
                                    span = $('<span></span>', {'class': "select-img"}),
                                    currentIndex = baseLine + i,
                                    a;

                                // only first image selected
                                if (onlyFirstSelected) {
                                    cl = (i == 0 && rowNum == 1) ? "is-selected" : "";
                                } else { // all images selected
                                    cl = "is-selected";
                                }

                                a = $('<a></a>', {'class': cl, href: "#", id: img_id}).css("margin", border + "px");

                                n++;

                                // add to $scope
                                if (i == 0 && rowNum == 1) {
                                    $scope[selectArray][img_id] = url;
                                }

                                a.on('click', selectImg);
                                a.append(img);
                                d_row.append(a);

                                $(img).on('load', function(){
                                    // Adjust the position of Check icon
                                    var img_position = $(img).position(),
                                        span_left = img_position.left + ($(img).width()/2) - 23,
                                        span_top = img_position.top + ($(img).height()/2) - 23;

                                    span.css("left", span_left + "px").css("top", span_top + "px");
                                    a.append(span);
                                });

                            })();
                        }
                        i++;
                    }

                    if(photo){
                        // if total width is slightly smaller than
                        // actual div width then add 1 to each
                        // photo width till they match
                        i = 0;
                        while( tw < w )
                        {
                            var img1 = d_row.find("img:nth-child(" + (i + 1) + ")");
                            $(img1).each(function(){
                                $(this).width($(this).width() + 1);
                            });
                            i = (i + 1) % c;
                            tw++;
                        }
                        // if total width is slightly bigger than
                        // actual div width then subtract 1 from each
                        // photo width till they match
                        i = 0;
                        while( tw > w )
                        {
                            var img2 = d_row.find("img:nth-child(" + (i + 1) + ")");
                            $(img2).each(function(){
                                $(this).width($(this).width() - 1);
                            });
                            i = (i + 1) % c;
                            tw--;
                        }
                    }

                    // set row height to actual height + margins
                    d_row.height(ht + border * 2);

                    baseLine += c;
                }

                console.log('<<< placeImagesLoaded');

                // done, broadcast
                $scope.$emit("placeImagesLoaded");

                // remove loading animation
                picContainer.removeClass('loading-images');
            }

            function selectImg(e){

                e.preventDefault();
                e.stopPropagation();


                var imgID = this.id,
                    span = $("#check_" + imgID),
                    src = $($(this).find('img')[0]).attr('src');

                if (!editMode && enableLightbox) {

                    $.slimbox(src, "", { resizeDuration: 100});

                } else {

                    // deselect
                    if($(this).hasClass("is-selected")){
                        $(this).removeClass("is-selected");
                        $(span).hide();

                        $scope.$apply(function(){
                            console.log('delete selected image');
                            $scope[deselectArray][imgID] = $scope[selectArray][imgID];
                            delete $scope[selectArray][imgID];
                        });

                        // google analytics
                        if (typeof ga != 'undefined') {
                            ga('send', 'event', 'Save Panel Photos', 'Deselect', 'Save Panel');
                        }

                    }
                    // select
                    else{
                        $(this).addClass("is-selected");
                        $(span).show();
                        $scope.$apply(function(){
                            console.log('add selected image');
                            $scope[selectArray][imgID] = src;
                            if ($scope[deselectArray][imgID]) {
                                delete $scope[deselectArray][imgID];
                            }
                        });

                        // google analytics
                        if (typeof ga != 'undefined') {
                            ga('send', 'event', 'Save Panel Photos', 'Select', 'Save Panel');
                        }

                    }

                }

            }

            function parseImages () {
                console.log('last image load');
                // auto-sizing
                photo_array = $element.find('.photo-obj').children();
                console.log(photo_array);
                lastWidth = $($element).find("#picstest").innerWidth() - 15;
                picRow = $($element).find('.picrow');
                picRow.width(lastWidth);
                processPhotos(photo_array, lastWidth);
            }

            function resetImages () {
                $element.find('.photo-obj').empty();
                $element.find('.picrow').remove();
                $element.append('<div class="picrow" />');
            }

            function loadImages (newValue) {

                console.log('loadImages');
                console.log(newValue);

                if (typeof newValue !== 'undefined'
                    && typeof newValue.length !== 'undefined'
                    && newValue.length > 0) {

                    // empty first
                    resetImages();

                    var i = newValue,
                        len = i.length,
                        len2 = len,
                        x = 0,
                        photoObj = $element.find('.photo-obj');

                    console.log('len2: ' + len2);

                    while(len2--) {

                        photoObj.prepend(
                            $('<img src="' + newValue[len2] + '">')
                            .on('error',function(){
                                console.log('image loading error');
                                $(this).remove();
                                if (++x == len) {
                                    console.log(x);
                                    parseImages();
                                }
                            }).on('load', function(){
                                console.log('image loaded successfully');
                                // remove images smaller than 100 on either dimension
                                if (this.width < 250 || this.height < 250) {
                                    $(this).remove();
                                }

                                if (++x == len) {
                                    console.log(x);
                                    parseImages();
                                }
                            })
                        );
                    }

                } else {
                    console.log('no images');
                    // $(picPhotoObj).empty();
                }

            }

            $scope.$watch(displayArray, function(newValue, oldValue){
                if (!arraysAreEqual(newValue, oldValue)) {
                    loadImages(newValue);
                }

            }, true);

            $scope.$on('stateChange', function() {
                if (typeof BroadcastService.message == 'object' &&
                    BroadcastService.message.type == 'pointEditModeChanged') {
                    editMode = BroadcastService.message.data.editMode;
                }
            });

        }
    };
});

// http://stackoverflow.com/questions/10931315/how-to-preventdefault-on-anchor-tags-in-angularjs
/*
directives.directive('a', function() {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
                elem.on('click', function(e){
                    e.preventDefault();
                });
            }
        }
   };
});
*/
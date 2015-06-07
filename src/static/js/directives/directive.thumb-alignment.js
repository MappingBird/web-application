/**
 * MappingBird Directive
 * Thumb Alignment
 */
mappingbird.directives.directive('thumbAlignment', ['$compile', function($compile){
    return {
        restrict: 'A',
        scope: true,
        replace: false,
        template: '<div class="photo-obj"></div><div id="picstest"></div>',
        controller: ['$scope', '$element', '$attrs', 'BroadcastService', 'Utility', function($scope, $element, $attrs, BroadcastService, Utility){

            var config = $scope.$eval($attrs.thumbAlignment),
                displayArray = config.displayArray,
                selectImages = config.selectImages || {},
                deselectImages = config.deselectImages || {},
                onlyFirstSelected = config.onlyFirstSelected,
                whiteBackground = config.whiteBackground,
                photo_array = null, //photo.js
                lastWidth = 0, // photo.js
                picPhotoObj = $($($element).find(".photo-obj")[0]), // photo.js
                picContainer = $($element), // photo.js
                editMode = config.editMode || false,
                enableLightbox = config.enableLightbox || false,
                loadingAnimation = $('<div class="loading">Loading...<img src="/static/img/loading-circle.png"></div>'),
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
                    photo,
                    imageSelected = false // will define image on map overlay
                    ;

                console.log('lastWidth: ' + lastWidth);
                console.log('innerwidth: ' + w);
                console.log('numPhotos: ' + numPhotos);

                // store relative widths of all images (scaled to match estimate height above)
                $.each(photos, function(key, val) {

                    var wt = parseInt(val.naturalWidth, 10),
                        ht = parseInt(val.naturalHeight, 10);

                    if( ht != h ) { wt = Math.floor(wt * (h / ht)); }

                    ws.push(wt);

                });

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
                    var tw = 0,
                        currIndex = 0;

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
                            (function(i) {
                                var url = photos[baseLine + i].src,
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

                                    selectImages[img_id] = url;
                                    $scope[selectImages][img_id] = url;

                                    BroadcastService.prepForBroadcast({
                                        type: 'savePointSetImage',
                                        data: {
                                            imageUrl: photos[baseLine + i].src
                                        }
                                    });
                                } else { // all images larger than 250 pixels selected
                                    if (photos[baseLine + i].naturalWidth > 250 || photos[baseLine + i].naturalHeight > 250) {
                                        cl = "is-selected";
                                        if (!imageSelected) {
                                            imageSelected = true;
                                            BroadcastService.prepForBroadcast({
                                                type: 'savePointSetImage',
                                                data: {
                                                    imageUrl: photos[baseLine + i].src
                                                }
                                            });
                                        }

                                        // add to $scope
                                        selectImages[img_id] = url;
                                        $scope[selectImages][img_id] = url;

                                    } else {
                                        cl = "";
                                    }
                                }

                                a = $('<a></a>', {'class': cl, href: "#", id: img_id}).css("margin", border + "px");

                                n++;

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

                            })(i);
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

                // images loaded
                loadingAnimation.remove();
                $scope.$emit('placeImagesLoaded');
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
                            deselectImages[imgID] = selectImages[imgID];
                            $scope[deselectImages][imgID] = $scope[selectImages][imgID];
                            delete selectImages[imgID];
                            delete $scope[selectImages][imgID];
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
                            selectImages[imgID] = src;
                            $scope[selectImages][imgID] = src;
                            if (deselectImages[imgID]) {
                                delete deselectImages[imgID];
                            }
                            if ($scope[deselectImages][imgID]) {
                              delete $scope[deselectImages][imgID];
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
                $element.append(loadingAnimation);
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
                                if (this.width < 100 || this.height < 100) {
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
                    console.log('no images - empty photo');
                    resetImages();
                    loadingAnimation.remove();
                    $scope.$emit('placeImagesLoaded');
                }

            }

            $scope.$watch(displayArray, function(newValue, oldValue){
                if (!Utility.arraysAreEqual(newValue, oldValue)) {
                    loadImages(newValue);
                }

            }, true);

            $scope.$on('stateChange', function() {
                if (typeof BroadcastService.message == 'object' &&
                    BroadcastService.message.type == 'pointEditModeChanged') {
                    editMode = BroadcastService.message.data.editMode;
                }
            });

        }]
    };
}]);

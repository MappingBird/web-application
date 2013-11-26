/*
 * jQuery Tiles Gallery v1.2
 * by Diego Imbriani aka Darko Romanov
 * http://romanovian.com
 */

(function($){
	$.shuffle = function(arr) {
	for(var j, x, i = arr.length; i;
			j = parseInt(Math.random() * i),
			x = arr[--i], arr[i] = arr[j], arr[j] = x
		);
		return arr;
	}

	function _jquerytg_getNatural (el) {
	    var img = new Image();
	    img.src = el.src;
	    return {width: img.width, height: img.height};
	}

	function _jquerytg_imgLoaded(img, counters, images, options) {
		var k = $(img).data('k');
		var counter = counters["jquery-tg" + k];
		images[this.src] = {
			width: this.width,
			height: this.height,
			ratio: this.width / this.height
		};

		if(++counter.loadedImages == counter.totalImages) {
			var e = this;
			$(".preload").remove();
			counters["jquery-tg" + k].source.find(".loading").remove();
			_jquerytg_doTile(counters, k, options);
		}
	}

	function _jquerytg_addCaptionByImage(img, options) {
		var _el = img;
		var title = _el.attr("alt");
		_el.removeAttr("alt");
		
		if(title != undefined && $.trim(title).length > 0) {
			var caption = $("<p class='caption' />");
			var span = $("<span class='text' />");
			span.text(title);
			caption.append(span);
			if(options.captionOnMouseOver) {
				caption.hide();
				_el.parents(".tiles-content").hover(
					function () {
						caption.slideDown();
					},
					function () {
						caption.slideUp();
					}
				)
			}
			_el.parents(".tiles-content").append(caption);
		}			
	}

	function _jquerytg_addCaptions(counters, k, options) {
		var source = counters["jquery-tg" + k].source;

		var _images = source.find("img");
		for(var i=0; i<_images.size(); i++) {
			_jquerytg_addCaptionByImage(_images.eq(i), options);
		}
		source.find(".caption").css({
			bottom:0,
			left:0,
			zIndex:2,
			position: "absolute",
			width: "100%"
		});
	}

	function _jquerytg_doTile(counters, k, options) {
		var source = counters["jquery-tg" + k].source;
		source.find(".jquery-tiles").remove();
		var tiles_cnt = $("<div class='jquery-tiles' />");
		source.empty().append(tiles_cnt);
		
		var w = options.width;
		var h = options.height;
		
		var anchorV = options.verticalAlign;
		var anchorH = options.horizontalAlign;

		var first = $("<div class='tiles-item' />");
		first.width(w - options.margin);
		first.height(h - options.margin);
		
		tiles_cnt.append(first);
		
		var depth=0;
		while(depth < counters["jquery-tg" + k].totalImages - 1) {

			var items = tiles_cnt.find(".tiles-item:empty");
			var index = 0;
			var biggerArea = 0;
			for(var i=0; i<items.size(); i++) {
				var _el = items.eq(i);
				var area = _el.width() * _el.height();
				if(area > biggerArea) {
					biggerArea = area;
					index = i;
				}
			}
			
			var item = items.eq(index);
			var itemWidth = item.width();
			var itemHeight = item.height();
			
			var w1 = h1 = 0;
			var w2 = h2 = 0;
			
			if(itemHeight > itemWidth) {
				w1 = itemWidth;
				w2 = itemWidth;

				var t = itemHeight * .5;
				h1 = Math.round((itemHeight / 2) + (Math.random() * t - (t/2)));
				h2 = itemHeight - h1;
			} else {
				h1 = itemHeight;
				h2 = itemHeight;

				var t = itemWidth * .5;
				w1 = Math.round((itemWidth / 2) + (Math.random() * t - (t/2)));
				w2 = itemWidth - w1;
			}			
			
			var child1 = $("<div class='tiles-item' />");
			child1.width(w1);
			child1.height(h1);
			child1.css({
				float: "left",
				overflow: "hidden"
			});
			
			var child2 = $("<div class='tiles-item' />");
			child2.width(w2);
			child2.height(h2);
			child2.css({
				float: "left",
				overflow: "hidden"
			});
			
			item.append(child1).append(child2);
			
			depth++;
		}										
		source.find(".tiles-item").css({
			position: "relative"
		});
		
		var _empty = source.find(".tiles-item:empty");
		for(var i=0; i<_empty.size(); i++) {
			var _el = _empty.eq(i);
			_el.addClass("tiles-content");
			_el.addClass(options.contentClass).css({
				marginRight: options.margin,
				marginBottom: options.margin
			});

			_el.width(_el.width() - options.margin);
			_el.height(_el.height() - options.margin);
			
			var e_w = _el.width();
			var e_h = _el.height();				

			var lastItem = counters["jquery-tg" + k].lastItem++;
			var item = counters["jquery-tg" + k].tilesItems.eq(lastItem % counters["jquery-tg" + k].totalImages).clone(true, true);
			item.appendTo(_el);

			var img = item.find("img");

			if(img.size() > 0) {
				img.removeAttr("style");
				var size = _jquerytg_getNatural(img.get(0));

				var i_w = size.width;
				var i_h = size.height;

				var i_ratio = i_w / i_h; 
				var e_ratio = e_w/ e_h;

				var dataAlign = img.data("jtg-align");
				var dataValign = img.data("jtg-valign");

				if(dataAlign == undefined)
					dataAlign = anchorH;
				if(dataValign == undefined)
					dataValign = anchorV;

				if(i_ratio <= e_ratio) {
					var h = Math.round(e_w / i_ratio);
					var mTop = 0;
					switch(dataValign) {
						default:
						case 'middle':
							mTop = Math.round((h - e_h) / -2);
							break;
						case 'top':
							mTop = 0;
							break;
						case 'bottom':
							mTop = (h - e_h) * (-1);
					}
					img.css({
						height: h,
						width: e_w,
						marginTop: mTop
					});
				} else {
					var w = Math.round(e_h * i_ratio);
					var mLeft = Math.round((w - e_w) / -2);
					switch(dataAlign) {
						default:
						case 'center':
							mLeft = Math.round((w - e_w) / -2);
							break;
						case 'left':
							mLeft = 0;
							break;
						case 'right':
							mLeft = (w - e_w) * (-1);
					}
					
					img.css({
						height: e_h,
						width: w,
						marginLeft: mLeft
					});						
				}
				img.css({
					position: "absolute",
					zIndex: 1,
					top: 0,
					left: 0
				});
				img.show();
			}				
		}
		if(options.caption)
			_jquerytg_addCaptions(counters, k, options);
		if($.isFunction(options.callback)) {
			options.callback.call(source);
		}
	}

	$.fn.tilesGallery = function(options) {		
		var defaults = {
			margin:3,
			caption: true,
			captionOnMouseOver: true,
			verticalAlign: 'middle',
			horizontalAlign: 'center'
		};
		var options = $.extend(defaults, options); 				
		var counters = {}; 
		var images = {};
		
		var elementCounter = 0;

		this.css({
			position: 'relative',
			overflow: 'hidden',				
			paddingTop: options.margin,
			paddingLeft: options.margin
		});

		return this.each(function() {
			var matchedElement = $(this);
			var k = ++elementCounter + Math.random();
			counters["jquery-tg" + k] = {
				totalImages : $("img", this).size(),
				loadedImages : 0,
				lastItem : 0,
				source : matchedElement,
				tilesItems : $.shuffle(matchedElement.children())
			};

			if(options.width) {
				matchedElement.css({
					width: options.width - ($.browser.msie ? 0 : options.margin)
				});
			}
			if(options.height) {
				matchedElement.css({
					height: options.height - ($.browser.msie ? 0 : options.margin)
				});
			}

			matchedElement.append("<span class='loading' />");
			matchedElement.find(".loading").css({
				position: "absolute",
				top: options.height / 2,
				left: "50%"
			});

			$(".jquerytg-preload").remove();
			var element = this;
			setTimeout(function () {
				var _preload = $("img", element);
				for (var i=0; i<_preload.size(); i++) {
					var img = new Image();
					$(img).attr("data-k", k);
					img.onload = function () {
						_jquerytg_imgLoaded(this, counters, images, options);
					};
					img.onerror = function () {
						counters["jquery-tg" + k].loadedImages++;
					}
					$("body").append(img);
					$(img).addClass("jquerytg-preload").hide();
					img.src = _preload.eq(i).attr("src");
				}
			}, 500);
			
		});
	};
})(jQuery);
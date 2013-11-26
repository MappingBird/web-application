// JavaScript Document
function squareImg(oImg){ // crop the cover image on popup of pin
	var oW = oImg.width();
	var oH = oImg.height();
	if (oW > oH){ //landscape
		oImg.height(100);
		oImg.width(oW*(100/oH));
		oImg.css("margin-left", function(){
			return (-1)*(oImg.width() - 100)/2;
		});
	} else { //portrait
		oImg.width(100);
		oImg.height(oH*(100/oW));
		oImg.css("margin-top", function(){
			return (-1)*(oImg.height() - 100)/2;
		});
	}
	oImg.show();
}
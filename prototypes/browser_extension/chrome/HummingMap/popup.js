// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


var chromeContentSettings = {
	url_: null,
	incognito_: null,	
	tabID_: null,
	disableToChange_: null,
	hostname_reges_: new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im'),
	schemaChrome_regex_: /(chrome\:\/\/)/,

	tabsOnHighlighted: function() {
		//console.info("tabsOnHighlighted");
		this.getSettings();
	},
	
	tabsOnUpdated: function(tabId, props, tab) {		
		//-- avoid multiple calls
		if (props.status == "loading" && tab.selected) {
			//console.info('tabsOnUpdated');
			this.getSettings();
		}
	},	
	
	winsOnFocusChanged: function() {
		//console.info("winsOnFocusChanged");
		this.getSettings();
	},
	
	winsGetCurrent: function(win) {
		//console.info("winsGetCurrent");
		chrome.tabs.query({windowId: win.id, active: true}, (function(){			
			this.getSettings();
		}).bind(this));
	},
		
	init: function() {		
		chrome.tabs.onHighlighted.addListener(this.tabsOnHighlighted.bind(this));
		chrome.tabs.onUpdated.addListener(this.tabsOnUpdated.bind(this));		
		chrome.windows.onFocusChanged.addListener(this.winsOnFocusChanged.bind(this));
		chrome.windows.getCurrent(this.winsGetCurrent.bind(this));	
	},
  
	getSettings: function () {
		chrome.tabs.query({active: true, currentWindow: true}, (function(tabs) {
			var tab = tabs[0];
			this.incognito_ = tab.incognito;
			this.url_ = tab.url;
			this.tabID_ = tab.id;

			chrome.contentSettings.javascript.get({'primaryUrl': this.url_, 'incognito': this.incognito_}, (function(details) {
				this.url_ ? this.disableToChange_ = this.schemaChrome_regex_.test(this.url_) : this.disableToChange_ = false;
console.info("DisableToChange=" + this.disableToChange_ + ", " + details.setting);				
				if (this.disableToChange_) {	
					this.updateControl_({disabled: true, checked: false});
				} else {
					(details.setting == 'allow') ? 
						this.updateControl_({disabled: false, checked: false}) : 
						this.updateControl_({disabled: false, checked: true});
				}
			}).bind(this));
		}).bind(this));
	},
	
	changeSettings: function () {		
		if (!this.disableToChange_) {
			chrome.contentSettings.javascript.get({'primaryUrl': this.url_, 'incognito': this.incognito_}, (function(details) {
				setting = details.setting;
console.info(setting);
				if (setting) {
					var pattern = /^file:/.test(this.url_) ? this.url_ : this.url_.match(this.hostname_reges_)[0] + '/*';
				
					// old method : url.replace(/\/[^\/]*?$/, '/*')
					var newSetting = (setting == 'allow' ? 'block' : 'allow');
					chrome.contentSettings.javascript.set({
						'primaryPattern': pattern,
						'setting': newSetting,
						'scope': (this.incognito_ ? 'incognito_session_only' : 'regular')
						}, (function() {
							(newSetting == 'allow') ? 
								this.updateControl_({disabled: false, checked: false}) : 
								this.updateControl_({disabled: false, checked: true});								
								chrome.tabs.reload(this.tabID_);
							//setLocalStorageRule(pattern, newSetting);
					}).bind(this));
				}
				else {
					//console.error("error, the setting is "+setting);
				}
			}).bind(this));
		}
		else {
			if (chrome.infobars) {
				chrome.infobars.show({"tabId": this.tabID_, "path": "infobar.html"});
			}
			else {
				//console.error("You can't disable javascript on "+url);
			}			
		}
	},
	
	updateControl_: function(setting) {
		if (setting.disabled) {
			document.getElementById("disJS_chkbox").disabled  = true;
		} else {
			document.getElementById("disJS_chkbox").checked = setting.checked;
		}
	}
	
};

chromeContentSettings.init();


var placeProfileGenerator = {
  /**
   * Sends an XHR GET request to grab photos of lots and lots of kittens. The
   * XHR's 'onload' event is hooks up to the 'showPhotos_' method.
   *
   * @public
   */
  requestTextSearch: function() {
    var kt = document.getElementById('keyword_text');
    var xhr = new XMLHttpRequest();	
	xhr.open("GET", 'http://pingismo.appspot.com/textsearch?keyword=' + kt.value, true);	
    xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4) {
        // WARNING! Might be injecting a malicious script!
        document.getElementById("text").innerHTML = xhr.responseText;    
      }
    }
    xhr.send(null);
  },  
  
	pasteSelection: function() {
		chrome.tabs.executeScript( {code: "window.getSelection().toString();"}, function(selection) {
			if (typeof selection !== "undefined") {
				document.getElementById("keyword_text").value = selection[0];
			}
		});
	}
  
};

//-- register click event as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('send_btn').addEventListener('click', placeProfileGenerator.requestTextSearch, false);  
  document.getElementById('disJS_chkbox').addEventListener('change', chromeContentSettings.changeSettings.bind(chromeContentSettings));
  
  //-- inject JS window.getSelection()
  placeProfileGenerator.pasteSelection();
    
});



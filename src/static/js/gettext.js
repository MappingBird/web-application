// https://docs.djangoproject.com/en/1.8/topics/i18n/translation/#using-the-javascript-translation-catalog
// django do support javascript i18n using gettext
// But I implement javascript i18n in client side
window.gettext = (function () {

  // check language
  var index;
  if (document.cookie.match(/lang=zh-tw/)) {
    index = 1;
  } else if (document.cookie.match(/lang=en/)){
    index = 0;
  }

  var translateString = {
    // directive.p-alert.js
    'Point deleted successfully.': ['Point deleted successfully.', '刪除成功。'],
    'successfully.': ['successfully.', '成功'],
    'Point was changed to': ['Point was changed to', '更新地圖'],
    // mod.bucketlist.overlay.js
    'View Details': ['View Details', '詳細資料']
  };

  // get cookie lang=zh-tw or lang=en
  return function (string) {
      return translateString[string][index];
  };

})();

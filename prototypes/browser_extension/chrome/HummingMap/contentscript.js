// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.method == "getSelection")
    {	  
      sendResponse( {data: window.getSelection().toString()} );
    }
    else
    {
      sendResponse({}); // snub them.
    }
  });

(function(){
    var BASE='http://www.bucketlist-php.dev/',
        MAP_SAVE_URL=BASE+'app.html#/save',
        search=encodeURIComponent(getSelectionHtml()),
        url=encodeURIComponent(window.location.href),
        body,
        listener;


    function strip(html){
        if(html.length===0) return '';

        var tmp=document.createElement('DIV');
        tmp.innerHTML=html.replace(/[\t\r\s\n]/g,' ');
        return tmp.textContent||tmp.innerText;
    }

    function getSelectionHtml(){
        var html='';
        if(typeof window.getSelection!='undefined'){
            var sel=window.getSelection();
            if(sel.rangeCount){
                var container=document.createElement('div');
                for(var i=0,len=sel.rangeCount;i<len;++i){
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }
                html=container.innerHTML;
            }
        }else if(typeof document.selection!='undefined'){
            if(document.selection.type=='Text'){
                html=document.selection.createRange().htmlText;
            }
        }
        return strip(html);
    }

    window.open(MAP_SAVE_URL+'?url='+url+'&search='+search);

    /*
    if(search.length>0){
        window.open(MAP_SAVE_URL+'?url='+url+'&search='+search);
    } else {
        body=document.getElementsByTagName('body')[0];
        listener = function(e){
            search=encodeURIComponent(getSelectionHtml());
            window.open(MAP_SAVE_URL+'?url='+url+'&search='+search);
            this.removeEventListener('mouseup',listener,false);
        };
        body.addEventListener('mouseup',listener,false);
    }
    */

    return;

})();
/**
 * @file IE Fix (define console object)
 */
(function(){
    if (!window.console) {
        window.console = {
            log: function() {return false;},
            data: function() {return false;}
        };
    }
}());
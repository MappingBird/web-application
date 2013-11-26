/**
 * [ description]
 * @param  {[type]} $){                 })(jQuery [description]
 * @return {[type]}      [description]
 */
(function($){


    var base_url = PINGISMO.baseUrl,
        login_url = base_url + 'blapi/user',
        maps_url = base_url + 'maps'
        ;

    function isEmailValid(val) {
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return filter.test(val) ? true : false;
    }

    function AppViewModel () {

        var self = this;

        self.loginError = ko.observable(false);
        self.email = ko.observable('');
        self.password = ko.observable('');

        self.checkEmail = function() {
            var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (!isEmailValid($("#email").val())) {
                self.loginError(true);
                $("#email").focus();
                return false;
            }
            else{
                self.loginError(false);
            }
        };



        self.login = function() {

            // first validate email and password
            if (self.email() == '' ||  isEmailValid(self.email()) == false) {
                console.log('no/bad email');
                self.loginError(true);
            } else if (self.password() == '') {
                console.log('no password');
                self.loginError(true);
            } else {
                // post request
                $.ajax({
                    url: login_url,
                    type: "get",
                    contentType: "application/json",
                    data: {
                        email_address: self.email(),
                        password: self.password()
                    },
                    success: function(response, textStatus, jqXHR) {
                        console.log(response);

                        // log any previous user out
                        $.removeCookie('bkl_user');

                        // log new user in
                        $.cookie('bkl_user', response.id);

                        window.location = maps_url;

                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        console.log(textStatus);
                        console.log(errorThrown);
                        self.loginError(true);
                    }
                });
            }


            return false;

        };

    }


    ko.applyBindings(new AppViewModel());

    $(".btn-giant").click(function(e){
        e.preventDefault();
        $("form .control-group").addClass("error");
        $("form .error-message").show();
    });

    fixFooter();
    $("#email").focus();

})(jQuery);
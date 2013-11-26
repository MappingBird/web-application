/**
 * [ description]
 * @param  {[type]} $){                 })(jQuery [description]
 * @return {[type]}      [description]
 */
(function($){


    var base_url = PINGISMO.baseUrl,
        signup_url = base_url + 'blapi/user',
        password_minimum_length = 6;

    function isEmailValid(val) {
        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return filter.test(val) ? true : false;
    }

    function AppViewModel () {

        var self = this;

        self.emailError = ko.observable(false);
        self.accountExistsError = ko.observable(false);
        self.passwordError = ko.observable(false);
        self.signUpComplete = ko.observable(false);
        self.email = ko.observable('');
        self.password = ko.observable('');
        self.numCollections = ko.observable();

        self.checkEmail = function() {
            var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if (!isEmailValid($("#email").val())) {
                self.emailError(true);
                $("#email").focus();
                return false;
            }
            else{
                self.emailError(false);
            }
        };

        

        self.signup = function() {

            var gu_id = '';

            // first validate email and password
            if (self.email() == '' ||  isEmailValid(self.email()) == false) {
                self.emailError(true);
            } else if (self.password() == '' || self.password().length < password_minimum_length) {
                self.passwordError(true);
            } else {
                // then check for previous generated user information
                // add to request
                if ($.cookie('bkl_user')) {
                    gu_id = $.cookie('bkl_user');
                }
                // post request
                $.ajax({
                    url: signup_url,
                    type: "post",
                    contentType: "application/json",
                    data: JSON.stringify({
                        email_address: self.email(),
                        password: self.password(),
                        gu_id: gu_id
                    }),
                    error: function(jqXHR, textStatus, errorThrown){
                        if (textStatus === 'error') {
                            switch (errorThrown) {
                                case 'Forbidden':
                                    self.accountExistsError(true);
                                    break;
                                default:
                                    break;
                            }
                        }
                    },
                    success: function(response, textStatus, jqXHR) {
                        console.log(response);

                        $.cookie('bkl_user', response.id);

                        if (typeof response.collections !== 'undefined') {
                            self.numCollections(response.collections.length);
                        }

                        self.signUpComplete(true);

                    }
                });
            }


            return false;

        };

    }


    ko.applyBindings(new AppViewModel());

    fixFooter();
    $("#email").focus();

})(jQuery);
// login_spec.js
describe('Login page', function() {

    var baseUrl = 'http://localhost:8000',
        inputEmail = element(by.model('email')),
        inputPassword = element(by.model('password')),
        loginButton = element(by.id('login-button')),
        loginError = element(by.id('error'));


    function attemptLogin(email, password) {

        inputEmail.clear();
        inputPassword.clear();

        inputEmail.sendKeys(email);
        inputPassword.sendKeys(password);
        loginButton.click();
    }


    it('should be able to load login page', function() {

        browser.get(baseUrl + '/static/login.html');

    });

    it('should show error if login without valid email address', function() {

        // no email address
        attemptLogin('', 'asdfasdf');
        expect(loginError.isDisplayed()).toBe(true);

        // malformed email address
        attemptLogin('asdf', 'asdfasdf');
        expect(loginError.isDisplayed()).toBe(true);

        attemptLogin('asdf@', 'asdfasdf');
        expect(loginError.isDisplayed()).toBe(true);

        attemptLogin('asdf@...', 'asdfasdf');
        expect(loginError.isDisplayed()).toBe(true);


    });

    it('should show error if login without password', function() {

        // no password
        attemptLogin('mhpalmer@gmail.com', '');
        expect(loginError.isDisplayed()).toBe(true);

        // malformed password
        attemptLogin('mhpalmer@gmail.com', 'a');
        expect(loginError.isDisplayed()).toBe(true);

    });

    it('should be able to login correctly', function() {

        attemptLogin('mhpalmer@gmail.com', 'asdfasdf');
        browser.sleep(5000);
        expect(browser.getCurrentUrl()).toEqual(baseUrl + '/static/app.html#/');

    });

    it('should be able to logout correctly', function() {

        element(by.binding('user.email')).click();
        element(by.id('link-logout')).click();
        browser.sleep(5000);
        expect(browser.getCurrentUrl()).toEqual(baseUrl + '/static/index.html');

    });

});
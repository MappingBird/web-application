// login_spec.js
describe('MappingBird login page', function() {

    var inputEmail = element(by.model('email')),
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

        browser.get('http://localhost:8000/static/login.html');

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
        expect(browser.getCurrentUrl()).toEqual('http://localhost:8000/static/app.html#/');

    });

});
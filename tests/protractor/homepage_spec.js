// homepage_spec.js
describe('Not logged in homepage', function() {
    /*
    var firstNumber = element(by.model('first'));
    var secondNumber = element(by.model('second'));
    var goButton = element(by.id('gobutton'));
    var latestResult = element(by.binding('latest'));
    var history = element.all(by.repeater('result in memory'));
    */
    var baseUrl = 'http://localhost:8000',
        loggedOutMenu = element(by.id('logged-out-menu')),
        registeredUserMenu = element(by.id('registered-user-menu')),
        unregisteredUserMenu = element(by.id('unregistered-user-menu'));

    it('should should open the homepage', function() {

        browser.get(baseUrl + '/static/index.html');

    });

    it('should display the sign in menu', function() {

        expect(loggedOutMenu.isDisplayed()).toBe(true);

    });

    it('should hide the registered user menu', function() {

        expect(registeredUserMenu.isDisplayed()).toBe(false);

    });

    it('should hide the unregistered user menu', function() {

        expect(unregisteredUserMenu.isDisplayed()).toBe(false);

    });
});
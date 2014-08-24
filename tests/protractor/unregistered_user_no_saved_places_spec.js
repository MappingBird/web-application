// unregistered_user_no_saved_places_spec.js
describe('Unregistered user with no saved places', function() {

    var baseUrl = 'http://localhost:8000',
        loggedOutMenu = element(by.id('logged-out-menu')),
        registeredUserMenu = element(by.id('registered-user-menu')),
        unregisteredUserMenu = element(by.id('unregistered-user-menu'));

    it('should should open the homepage', function() {

        browser.get(baseUrl + '/static/index.html');
        browser.sleep(5000);

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

    // test issue because the bookmarklet has to hardcode the production URL
    it('should display "No Places Saved" when click on "Remember This Place" button', function() {

        element(by.id('get-started-remember-button')).click();
        browser.sleep(5000);
        browser.getAllWindowHandles().then(function (handles) {
            newWindowHandle = handles[1];
            browser.switchTo().window(newWindowHandle).then(function () {
                expect(browser.getCurrentUrl()).toEqual('http://www.mappingbird.com/static/app.html#/save?url=http:%2F%2Flocalhost:8000%2Fstatic%2Findex.html&search=');
                expect(element(by.css('.map-dialog')).isDisplayed()).toBe(true);
            });
            browser.close();
            browser.switchTo().window(handles[0]);
        });

    });

    it('should display "No Places Saved" when directly input app URL', function() {

        browser.get(baseUrl + '/static/app.html')
        browser.sleep(5000);
        expect(element(by.css('.map-dialog')).isDisplayed()).toBe(true);

    });


    // using URL to simulate this because it's impossible to script clicking on a bookmark
    it('should display search panel when select text and click bookmarklet', function() {

        browser.get(baseUrl + '/static/app.html#/save?url=http:%2F%2Fen.wikipedia.org%2Fwiki%2FEiffel_Tower&search=Eiffel%20Tower')
        browser.sleep(5000);
        expect(element(by.css('.save-panel')).isDisplayed()).toBe(true);

    });

    // using URL to simulate this because it's impossible to script clicking on a bookmark
    it('should display select text overlay when no select text and click bookmarklet', function() {

        browser.get(baseUrl + '/static/app.html#/save?url=http:%2F%2Fen.wikipedia.org%2Fwiki%2FEiffel_Tower&search=')
        browser.sleep(10000);
        expect(element(by.css('.massive-alert')).isDisplayed()).toBe(true);

    });


    // reset the test - delete all cookies
    browser.manage().deleteAllCookies();


});
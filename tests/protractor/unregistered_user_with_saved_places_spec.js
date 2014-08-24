// unregistered_user_with_saved_places_spec.js
describe('Unregistered user with saved places', function() {

    var baseUrl = 'http://localhost:8000',
        loggedOutMenu = element(by.id('logged-out-menu')),
        registeredUserMenu = element(by.id('registered-user-menu')),
        unregisteredUserMenu = element(by.id('unregistered-user-menu'));

    var hasClass = function (element, cls) {
        return element.getAttribute('class').then(function (classes) {
            return classes.split(' ').indexOf(cls) !== -1;
        });
    };


    // reset the test - delete all cookies
    browser.manage().deleteAllCookies();


    // create an unregistered user by saving a place
    // using URL to simulate this because it's impossible to script clicking on a bookmark
    it('should display search panel when select text and click bookmarklet', function() {

        browser.get(baseUrl + '/static/app.html#/save?url=http:%2F%2Fen.wikipedia.org%2Fwiki%2FEiffel_Tower&search=Eiffel%20Tower');
        browser.sleep(5000);
        expect(element(by.css('.save-panel')).isDisplayed()).toBe(true);

    });


    it('should create a new collection to add the point to', function(){

        // create new collection
        element(by.id('input-new-collection-name')).sendKeys('New collection');
        element(by.id('btn-create-collection')).click();
        browser.sleep(1000);
        expect(element(by.binding('saveCollectionName')).isDisplayed()).toBe(true);
        expect(element(by.binding('saveCollectionName')).getText()).toEqual('New collection');

    });

    it('should be able to modify the point type', function(){

        // create new collection
        element(by.css('.form-save-content .types-scenicspot')).click();
        expect(hasClass(element(by.xpath("//div[@class='save-content']/form/ul[@class='types']/li[a[@class='types-scenicspot']]")),'active')).toBe(true);

    });

    it('should be able to save the point', function(){

        // create new collection
        element(by.id('save-to-map')).click();
        //expect( hasClass( element( by.id( 'map' ), 'full' ) ).toBe ( true );
        expect(element(by.binding('activeCollectionPointLength')).getText()).toEqual('1');
    });


    it('should should open the homepage', function() {

        browser.get(baseUrl + '/static/index.html?stay=1');
        browser.sleep(5000);

    });

    it('should hide the sign in menu', function() {

        expect(element(by.id('logged-out-menu')).isDisplayed()).toBe(false);

    });

    it('should hide the registered user menu', function() {

        expect(element(by.id('registered-user-menu')).isDisplayed()).toBe(false);

    });

    it('should display the unregistered user menu', function() {

        expect(element(by.id('unregistered-user-menu')).isDisplayed()).toBe(true);

    });



    // test issue because the bookmarklet has to hardcode the production URL
    it('should display "No Places Saved" when click on "Remember This Place" button', function() {

        element(by.id('get-started-remember-button')).click();
        browser.sleep(5000);
        browser.getAllWindowHandles().then(function (handles) {
            newWindowHandle = handles[1];
            browser.switchTo().window(newWindowHandle).then(function () {
                expect(browser.getCurrentUrl()).toEqual('http://www.mappingbird.com/static/app.html#/save?url=http:%2F%2Flocalhost:8000%2Fstatic%2Findex.html%3Fstay%3D1&search=');
                expect(element(by.css('.map-dialog')).isDisplayed()).toBe(true);
            });
            browser.close();
            browser.switchTo().window(handles[0]);
        });

    });

    it('should display saved places when click on "View Map" menu items', function() {

        browser.get(baseUrl + '/static/index.html?stay=1');
        browser.sleep(5000);
        element(by.css('#unregistered-user-menu .dropdown-toggle')).click();
        element(by.css('#unregistered-user-menu a[href="/static/app.html#/"]')).click();
        browser.sleep(5000);
        expect(element(by.id('map')).getAttribute('class')).toEqual('ng-scope full');

    });

    it('should display saved places when directly input app URL', function() {

        browser.get(baseUrl + '/static/app.html');
        browser.sleep(5000);
        expect(element(by.id('map')).getAttribute('class')).toEqual('ng-scope full');

    });


    // using URL to simulate this because it's impossible to script clicking on a bookmark
    it('should display search panel when select text and click bookmarklet', function() {

        browser.get(baseUrl + '/static/app.html#/save?url=http:%2F%2Fen.wikipedia.org%2Fwiki%2FEiffel_Tower&search=Eiffel%20Tower');
        browser.sleep(5000);
        expect(element(by.css('.save-panel')).isDisplayed()).toBe(true);

    });

    // using URL to simulate this because it's impossible to script clicking on a bookmark
    it('should display select text overlay when no select text and click bookmarklet', function() {

        browser.get(baseUrl + '/static/app.html#/save?url=http:%2F%2Fen.wikipedia.org%2Fwiki%2FEiffel_Tower&search=');
        browser.sleep(5000);
        expect(element(by.css('.massive-alert')).isDisplayed()).toBe(true);

    });

    // reset the test - delete all cookies
    browser.manage().deleteAllCookies();


});
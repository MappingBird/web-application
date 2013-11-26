(function( $ ) {

    /* Basic tests of all flows by a user on the site.  This test case may
       become part of production monitoring.  More extensive tests (e.g. for
       business logic, alternative data) should go into separate files. */
       
    var authHeader,
        apiKey,
        userUri,
        userId,
        collectionUri,
        collectionId,
        pointUri,
        pointId,
        imageUri,
        imageId,
        emailAddress = makeRandomEmail(); // Random e-mail until can delete account
    
    queuedModule("flows");
    
    queuedAsyncTest("user: creates account", function() {
        expect( 2 );
        $.ajax({
            url: "/blapi/user",
            type: "post",
            contentType: "application/json",
            data: $.toJSON({
                //first_name: "John",
                //last_name: "Doe",
                //username: "johndoe" + Math.floor(Math.random()*100),
                email_address: emailAddress,
                password: "testing"
            }),
            success: function(response, textStatus, jqXHR) {
                console.log(response);
                ok(response.resource_uri);
                //equal(response.first_name, "John");
                //equal(response.last_name, "Doe");
                equal(response.email_address, emailAddress);

                //apiKey = response.api_key;

                //authHeader = "ApiKey " + response.email_address + ":" + response.api_key;

                userUri = response.resource_uri;
                userId = response.id;
            },
            complete: function() {
                start();
                nextTest(); // Resume test framework
            }
        });
    });

    queuedAsyncTest("user: creates new collection", function() {
        expect( 2 );
        $.ajax({
            url: "/blapi/collection",
            type: "post",
            contentType: "application/json",
            data: $.toJSON({
                name: "Paris",
                user_id: userId
            }),
            success: function(response, textStatus, jqXHR) {
                console.log(response);
                ok(response.resource_uri);
                equal(response.name, "Paris");

                collectionUri = response.resource_uri;
                collectionId = response.id;
            },
            complete: function() {
                start();
                nextTest(); // Resume test framework
            }
        });
    });

    queuedAsyncTest("user: updates collection name", function() {
        expect( 2 );
        $.ajax({
            url: "/blapi/collection",
            type: "post",
            contentType: "application/json",
            data: $.toJSON({
                id: collectionId,
                name: "Taipei"
            }),
            success: function(response, textStatus, jqXHR) {
                console.log(response);
                ok(response.resource_uri);
                equal(response.name, "Taipei");
            },
            complete: function() {
                start();
                nextTest(); // Resume test framework
            }
        });
    });

    queuedAsyncTest("user: creates new point", function() {
        expect( 8 );
        $.ajax({
            url: "/blapi/point",
            type: "post",
            contentType: "application/json",
            data: $.toJSON({
                title: "Eiffel Tower",
                url: "http://www.eiffel.fr/",
                text: "Eiffel Tower is a great destination!",
                place_name: "Eiffel Tower",
                place_address: "Champ de Mars, 5 Avenue Anatole France, Paris, France",
                place_phone: "+33 1 23 45 67 89",
                gps_coords: "48.859492,2.294254",
                collection_id: collectionId
            }),
            success: function(response, textStatus, jqXHR) {
                console.log(response);
                ok(response.resource_uri);
                equal(response.title, "Eiffel Tower");
                equal(response.url, "http://www.eiffel.fr/");
                equal(response.text, "Eiffel Tower is a great destination!");
                equal(response.place_name, "Eiffel Tower");
                equal(response.place_address, "Champ de Mars, 5 Avenue Anatole France, Paris, France");
                equal(response.place_phone, "+33 1 23 45 67 89");
                equal(response.gps_coords, "48.859492,2.294254");

                pointUri = response.resource_uri;
                pointId = response.id;
            },
            complete: function() {
                start();
                nextTest(); // Resume test framework
            }
        });
    });

    queuedAsyncTest("user: updates point", function() {
        expect( 5 );
        $.ajax({
            url: "/blapi/point",
            type: "post",
            contentType: "application/json",
            data: $.toJSON({
                id: pointId,
                title: "Eiffel Tower is da Best",
                url: "http://www.eiffel-tower.fr/",
                text: "Eiffel Tower is a grizzeat destination!",
                gps_coords: "48.859493,2.294255",
                collection_id: collectionId
            }),
            success: function(response, textStatus, jqXHR) {
                console.log(response);
                ok(response.resource_uri);
                equal(response.title, "Eiffel Tower is da Best");
                equal(response.url, "http://www.eiffel-tower.fr/");
                equal(response.text, "Eiffel Tower is a grizzeat destination!");
                equal(response.gps_coords, "48.859493,2.294255");
            },
            complete: function() {
                start();
                nextTest(); // Resume test framework
            }
        });
    });

    queuedAsyncTest("user: creates new image", function() {
        expect( 3 );
        $.ajax({
            url: "/blapi/image",
            type: "post",
            contentType: "application/json",
            data: $.toJSON({
                url: "http://www.eiffel.fr/eiffel.jpg",
                thumb_path: "/thumb/path/eiffel.jpg",
                point_id: pointId
            }),
            success: function(response, textStatus, jqXHR) {
                console.log(response);
                ok(response.resource_uri);
                equal(response.url, "http://www.eiffel.fr/eiffel.jpg");
                equal(response.thumb_path, "/thumb/path/eiffel.jpg");

                imageUri = response.resource_uri;
                imageId = response.id;
            },
            complete: function() {
                start();
                nextTest(); // Resume test framework
            }
        });
    });

    queuedAsyncTest("user: updates image", function() {
        expect( 3 );
        $.ajax({
            url: "/blapi/image",
            type: "post",
            contentType: "application/json",
            data: $.toJSON({
                id: imageId,
                url: "http://www.eiffel.fr/eiffels.jpg",
                thumb_path: "/thumb/path/eiffels.jpg"
            }),
            success: function(response, textStatus, jqXHR) {
                console.log(response);
                ok(response.resource_uri);
                equal(response.url, "http://www.eiffel.fr/eiffels.jpg");
                equal(response.thumb_path, "/thumb/path/eiffels.jpg");
            },
            complete: function() {
                start();
                nextTest(); // Resume test framework
            }
        });
    });

    queuedAsyncTest("user: deletes image", function() {
        expect( 1 );
        $.ajax({
            url: "/blapi/image",
            type: "delete",
            contentType: "application/json",
            data: {
                id: imageId
            },
            success: function(response, textStatus, jqXHR) {
                console.log(response);
                equal(response, null);
            },
            complete: function() {
                start();
                nextTest(); // Resume test framework
            }
        });
    });

    queuedAsyncTest("user: deletes point", function() {
        expect( 1 );
        $.ajax({
            url: "/blapi/point",
            type: "delete",
            contentType: "application/json",
            data: {
                id: pointId
            },
            success: function(response, textStatus, jqXHR) {
                console.log(response);
                equal(response, null);
            },
            complete: function() {
                start();
                nextTest(); // Resume test framework
            }
        });
    });

    queuedAsyncTest("user: deletes collection", function() {
        expect( 1 );
        $.ajax({
            url: "/blapi/collection",
            type: "delete",
            contentType: "application/json",
            data: {
                id: collectionId
            },
            success: function(response, textStatus, jqXHR) {
                console.log(response);
                equal(response, null);
            },
            complete: function() {
                start();
                nextTest(); // Resume test framework
            }
        });
    });

    queuedAsyncTest("user: deletes user", function() {
        expect( 1 );
        $.ajax({
            url: "/blapi/user",
            type: "delete",
            contentType: "application/json",
            data: {
                id: userId
            },
            success: function(response, textStatus, jqXHR) {
                console.log(response);
                equal(response, null);
            },
            complete: function() {
                start();
                nextTest(); // Resume test framework
            }
        });
    });
  
    
    nextTest(); // Start testing
    
    function makeRandomEmail() {
        var strValues="abcdefg12345";
        var strEmail = "";
        var strTmp;
        for (var i=0;i<10;i++) {
            strTmp = strValues.charAt(Math.round(strValues.length*Math.random()));
            strEmail = strEmail + strTmp;
        }
        strTmp = "";
        strEmail = strEmail + "@";
        for (var j=0;j<8;j++) {
            strTmp = strValues.charAt(Math.round(strValues.length*Math.random()));
            strEmail = strEmail + strTmp;
        }
        strEmail = strEmail + ".com";
        return strEmail;
    }

}( jQuery ) );

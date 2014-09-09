/**
 * MappingBird Service
 * Collections service
 */
services.factory('Collections', function(){
    return {
        collections: [],
        mostRecentModifiedCollection: -1,
        activeCollectionId: -1
    };
});
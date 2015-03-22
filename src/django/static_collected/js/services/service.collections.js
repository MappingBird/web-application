/**
 * MappingBird Service
 * Collections service
 */
mappingbird.services.factory('Collections', function(){
    return {
        collections: [],
        mostRecentModifiedCollection: -1,
        activeCollectionId: -1
    };
});
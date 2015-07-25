/**
 * MappingBird Service
 * Presets
 */
mappingbird.services.factory('Presets', function(){
    return {
        baseUrl: '/',
        parseUrl: '/scraper',
        userUrl: '/api/users',
        savePanelVisible: true,
        mapZoom: 13,
        minZoom: 2
    };
});

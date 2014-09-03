/**
 * MappingBird Service
 * Map Points service
 */
services.factory('MapPoints', function(){
    return {
        activeSavePoint: {
            icon: '',
            name: '',
            address: '',
            phone: '',
            coords: '',
            lat: 0,
            lng: 0,
            type: 'misc',
            image: ''
        },
        activeViewPoint: {
            id: -1,
            icon: '',
            name: '',
            address: '',
            phone: '',
            coords: '',
            lat: 0,
            lng: 0,
            type: 'misc',
            images: []
        },
        activeViewPoints: []
    };
});
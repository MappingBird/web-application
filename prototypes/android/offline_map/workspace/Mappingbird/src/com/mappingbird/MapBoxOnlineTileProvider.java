package com.mappingbird;

import java.net.URL;
import java.net.MalformedURLException;
import android.util.Log;
import com.google.android.gms.maps.model.UrlTileProvider;

public class MapBoxOnlineTileProvider extends UrlTileProvider {	    
    private static final String TAG = "MapBoxOnlineTileProvider";
 
    // ------------------------------------------------------------------------
    // Constructors
    // ------------------------------------------------------------------------
 
    public MapBoxOnlineTileProvider() {
        super(256, 256);        
    }
 
    // ------------------------------------------------------------------------
    // Public Methods
    // ------------------------------------------------------------------------
 
    @Override
    public URL getTileUrl(int x, int y, int z) {
        try {
        	Log.i(TAG, String.format(Constants.MAPBOX_URL_FORMAT, Constants.MAPBOX_ID, z, x, y));        	
            return new URL(String.format(Constants.MAPBOX_URL_FORMAT, Constants.MAPBOX_ID, z, x, y));
        }
        catch (MalformedURLException e) {
            return null;
        }
    }
}

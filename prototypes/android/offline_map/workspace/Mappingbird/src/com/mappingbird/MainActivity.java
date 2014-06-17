package com.mappingbird;

import java.io.File;
import java.io.FileDescriptor;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.util.HashSet;

import android.os.Bundle;
import android.os.Environment;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.Context;
import android.view.Menu;
import android.util.Log;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.TileOverlayOptions;
import com.google.android.gms.maps.model.TileOverlay;

public class MainActivity extends Activity {
	static String TAG = "MainActivity";
	static final float DEFAULT_BEG_ZOOM = 12;	
	static Context context_;	
	static GoogleMap map_ = null;
	
	public static Context getContext(){
		return context_;  
	}
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {		
		super.onCreate(savedInstanceState);
		
		context_ = getApplicationContext();
				
		setContentView(R.layout.activity_main);
		
	    if (map_ == null) {
	        map_ = ((MapFragment) getFragmentManager().findFragmentById(R.id.map))
	                            .getMap();
	        //-- Check if we were successful in obtaining the map.
	        if (map_ != null) {
	        	Log.i(TAG, "mMap is available.");	        		    			    		
	        		        		       
	        	
	        	new MapTileDownloaderTask().execute(new String[]{"�x�_��"});
	        	
	        	LatLng ll = new LatLng(25.023262, 121.548273); 	    			        	        
	    		map_.moveCamera(CameraUpdateFactory.newLatLngZoom(ll, Constants.DEFAULT_MAP_ZOOM));
//	    		mMap.addMarker(
//	    				new MarkerOptions()
//	    				.position(ll)
//	    				.title("Trend Micro"));
	    		
	    		map_.setMapType(GoogleMap.MAP_TYPE_NONE);
	    		TileOverlayOptions opts = new TileOverlayOptions();
	        	opts.tileProvider(new OfflineTileProvider());  //new MapBoxOnlineTileProvider());
	        	opts.zIndex(Constants.DEFAULT_MAP_ZOOM);
	        	TileOverlay tileOverlay = map_.addTileOverlay(opts);
	        }
	    }	
	}     

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.main, menu);
		return true;
	}
	
	


}


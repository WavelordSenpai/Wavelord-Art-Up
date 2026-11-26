package com.wavelord.artup;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import com.getcapacitor.BridgeActivity;

// One UI at a time: web UI inside the app, native bubble ONLY while the app is in the background.
public class MainActivity extends BridgeActivity {
    private boolean asked = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (!Settings.canDrawOverlays(this) && !asked) {
            asked = true; // ask once
            startActivityForResult(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getPackageName())), 77);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        stopService(new Intent(this, FloatingBuddyService.class)); // app open = no native bubble
        if (getIntent() != null && getIntent().getBooleanExtra("talk", false)) {
            getIntent().removeExtra("talk");
            if (getBridge() != null) getBridge().getWebView().postDelayed(() ->
                getBridge().getWebView().evaluateJavascript("window.openTalk&&window.openTalk()", null), 400);
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    @Override
    public void onPause() {
        super.onPause();
        if (Settings.canDrawOverlays(this)) { // start ONLY after permission is granted
            try {
                Intent s = new Intent(this, FloatingBuddyService.class);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) startForegroundService(s);
                else startService(s);
            } catch (Exception e) { e.printStackTrace(); }
        }
    }
}

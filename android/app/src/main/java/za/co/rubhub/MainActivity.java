package za.co.rubhub;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.os.Build;
import java.util.ArrayList; // Add this import

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize Capacitor Bridge first
        this.init(savedInstanceState, new ArrayList<>());
        
        // Now set your custom layout
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        
        // WebView settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);

        // Fix for cleartext traffic
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        // Handle SSL and cleartext
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        // Use your computer's IP address instead of localhost
        String serverUrl = "http://192.168.0.81:3000"; // Replace with your computer's IP
        
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // Load fallback page on error
                String errorHtml = "<html><body><h1>Error</h1><p>Failed to load: " + description + "</p></body></html>";
                webView.loadData(errorHtml, "text/html", "UTF-8");
            }
        });

        webView.loadUrl(serverUrl);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
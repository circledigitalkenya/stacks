#!/bin/bash
if [ ! -d "platforms/ios/" ]; then
  cordova platform add ios;
fi

if [ ! -d "plugins/com.phonegap.plugins.barcodescanner/" ]; then
  cordova plugin add https://github.com/wildabeast/BarcodeScanner;
fi

if [ ! -d "plugins/com.phonegap.plugins.sqlite/" ]; then
  cordova plugin add https://github.com/lite4cordova/Cordova-SQLitePlugin;
fi

if [ ! -d "plugins/org.apache.cordova.statusbar/" ]; then
  cordova plugin add org.apache.cordova.statusbar;
fi

if [ ! -d "plugins/org.apache.cordova.dialogs/" ]; then
  cordova plugin add org.apache.cordova.dialogs;
fi

if [ ! -d "plugins/org.apache.cordova.console/" ]; then
  cordova plugin add org.apache.cordova.console;
fi

if [ ! -d "plugins/org.apache.cordova.contacts/" ]; then
  cordova plugin add org.apache.cordova.contacts;
fi

if [ ! -d "plugins/org.apache.cordova.inappbrowser/" ]; then
  cordova plugin add org.apache.cordova.inappbrowser;
fi

# remove these two plugins since they bring problems when
# viewing the app on a browser
if [ -d "plugins/org.apache.cordova.device/" ]; then
  cordova plugin rm org.apache.cordova.device;
fi

if [ -d "plugins/org.apache.cordova.network-information/" ]; then
  cordova plugin rm org.apache.cordova.network-information # the newtwork info plugin comes with a whole set of issues when previewing the app on a browser http://stackoverflow.com/questions/20321532/phone-gap-device-ready-not-fired-after-5-seconds
fi




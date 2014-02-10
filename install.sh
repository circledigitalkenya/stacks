#!/bin/bash
cordova platform add ios
cordova plugin add https://github.com/wildabeast/BarcodeScanner
cordova plugin add https://github.com/lite4cordova/Cordova-SQLitePlugin
cordova plugin add org.apache.cordova.statusbar
cordova plugin add org.apache.cordova.dialogs
#cordova plugin add org.apache.cordova.network-information # the newtwork info plugin comes with a whole set of issues when previewing the app on a browser http://stackoverflow.com/questions/20321532/phone-gap-device-ready-not-fired-after-5-seconds
cordova plugin add org.apache.cordova.console
cordova plugin add org.apache.cordova.contacts
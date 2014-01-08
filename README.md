Starter Cordova Application
==========================

To run this, do:

```bash
$ cordova platform add ios
$ cordova plugin add https://github.com/wildabeast/BarcodeScanner
$ cordova plugin add https://github.com/lite4cordova/Cordova-SQLitePlugin
$ cordova plugin add org.apache.cordova.console
$ cordova plugin add com.apache.cordova.statusbar
$ cordova build ios
$ cordova emulate ios
$ open -a Xcode platforms/ios
```
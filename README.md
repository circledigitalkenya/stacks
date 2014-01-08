Starter Cordova Application
==========================

To run this, do:

```bash
$ git clone https://github.com/ryanhbowman/sqlite
$ cd sqlite
$ cordova platform add ios
$ cordova plugin add https://github.com/wildabeast/BarcodeScanner
$ cordova plugin add https://github.com/lite4cordova/Cordova-SQLitePlugin
$ cordova plugin add org.apache.cordova.console
$ cordova build ios
$ open -a Xcode platforms/ios
```

That last command opens the Xcode project that cordova has built
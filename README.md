# Requirements

[Apache Cordova 3.3.0](http://cordova.apache.org/)


# Installing
    
    $ cordova create com.example.xcode XcodeTest

    $ rm -r www/

    $ git clone https://github.com/ryanhbowman/sqlite 

    $ cordova platform add ios

    $ cordova plugin add https://github.com/wildabeast/BarcodeScanner

    $ cordova plugin add org.apache.cordova.console

    $ cordova plugin add com.apache.cordova.statusbar

    $ cordova plugin add https://github.com/lite4cordova/Cordova-SQLitePlugin

    $ cordova build

Open the ` platforms/ios/XcodeTest.xcodeproj ` in Xcode and build
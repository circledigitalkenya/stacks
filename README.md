Stacks
==========================

Stacks is an book store application built with [apache cordoova](http://cordova.apache.org/docs/en/3.3.0).

Development and testing at the moment targets the iOS platform but the application can be easily adapted 
to any of cordova's supported platforms.


# Dependencies

[Bower](http://bower.io)

[Grunt](http://gruntjs.com) ( only for development )


## Installing

````bash
$ git clone https://github.com/circledigitalkenya/stacks
$ cd stacks
$ bash install.sh
````

### Adding Bower components

```bash
$ cd www
$ bower install
```


### Previewing the application on a web browser

```bash
$ cordova serve ios
```

Navigate to [http://localhost:8000/ios/www/]() where the application is served for preview

### Previewing the application on an emualtor

```bash
$ cordova emulate ios
```

### Building the application on Xcode

You can alternatively build the application on Xcode and view it on an emualator or actual device, `.app` file is located
in the `platforms/ios` directory.

```bash
$ open -a Xcode platforms/ios
```

### Setting up a dev environment

Navigate to the root `stacks` folder and then run

```bash
$ npm install 
$ grunt
```
Grunt watches for changes and prepares the project for build. 
You should have `cordova serve ios` running in a new terminal window. 
You can now make changes to the application and reload the web browser for preview


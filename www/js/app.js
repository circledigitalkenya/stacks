// angular.module is a global place for creating, registering and retrieving Angular modules
// 'stacks' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'stacks.services' is found in services.js
// 'stacks.controllers' is found in controllers.js

document.addEventListener('deviceready', function(){

  angular.module('stacks', [
      'ngRoute',
      'ngTouch',
      'ngAnimate',
      'stacks.services',
      'stacks.controllers',
      'stacks.directives'
    ]
  )
  .config(function($routeProvider, databaseProvider) {

    // Use AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $routeProvider
      .when('/home', {
        templateUrl: 'templates/home.html'
      })
      .when("/build",{
        templateUrl: "templates/build_library.html",
        controller : "AddBookController"
      })
      .when("/add",{
        templateUrl: "templates/add.html",
        controller: "AddBookController"
      })
      .when("/addmanually",{
        templateUrl: "templates/add.manually.html",
        controller: "AddBookController"
      })
      .when("/book/",{
        templateUrl: "templates/book.html",
        controller: "BookController"
      })
      .when("/book/search",{
        templateUrl: "templates/search.html",
        controller: "BookController"
      })
      .when("/bookadded",{
        templateUrl: "templates/book.added.html"
      })
      .when("/search/results",{
        templateUrl: "templates/search.results.html",
        controller: "SearchResults"
      })
      .when("/search/noresults",{
        templateUrl: "templates/search.no_results.html",
        controller: "BookController"
      })
      .when("/library",{
        templateUrl: "templates/library.html",
        controller: "LibraryController"
      })
      .otherwise({
        redirectTo: '/home'
      });

    // connect to the database
    databaseProvider.connect('stacks');

    // style the application
    StatusBar.styleLightContent();

  })
  .run(function($rootScope){
    
    // set the conenction status to global scope
    // the connection plugin is bringing problems 
    // while debugging on the browser,
    // setting connection_available to true
    if( navigator.connection ) {
      $rootScope.connection_available = (navigator.connection.type == Connection.NONE) ? false : true;
    } else {
      $rootScope.connection_available = true;
    }

  })

  angular.bootstrap(document, ['stacks']);

});


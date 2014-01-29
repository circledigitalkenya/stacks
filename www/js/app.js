// angular.module is a global place for creating, registering and retrieving Angular modules
// 'ladders' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'ladders.services' is found in services.js
// 'ladders.controllers' is found in controllers.js

document.addEventListener('deviceready', function(){

  angular.module('ladders', [
      'ngRoute',
      'ladders.services',
      'ladders.controllers'
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
      .when("/add",{
        templateUrl: "templates/add.html",
        controller: "AddBookController"
      })
      .when("/addmanually",{
        templateUrl: "templates/add.manually.html",
        controller: "AddBookController"
      })
      .when("/scan",{
        templateUrl: "templates/scan.html"
      })
      .when("/add/options",{
        templateUrl: "templates/add.options.html"
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

      databaseProvider.connect('ladders');


  });

  angular.bootstrap(document, ['ladders']);
});



  
function createtables(tx){

  // @todo: remove this line in production
  tx.executeSql('DROP TABLE IF EXISTS books'); // only for debugging purposes, setup a fresh table on each app launch
  
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS books'+
    '('+
      'id INTEGER PRIMARY KEY AUTOINCREMENT,'+
      'isbn TEXT,'+
      'title TEXT,'+
      'description TEXT,'+
      'image_path TEXT,'+
      'author TEXT,'+
      'publisher TEXT,'+
      'year TEXT,'+
      'pages TEXT'+ 
    ')'
  );

}

// tansaction error callback
function errorCB(){
  console.log('error processing SQL: ' +err);
}

// Transaction success callback
function successCB() {
  console.log("success!");
}





document.addEventListener('deviceready', function(){

  // angular.module is a global place for creating, registering and retrieving Angular modules
  // 'ladders' is the name of this angular module example (also set in a <body> attribute in index.html)
  // the 2nd parameter is an array of 'requires'
  // 'ladders.services' is found in services.js
  // 'ladders.controllers' is found in controllers.js
  angular.module('ladders', ['ui.router','ladders.services', 'ladders.controllers', 'ladders.providers'])


  .config(function($stateProvider, $urlRouterProvider, databaseProvider) {

    // Use AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      .state('home', {
        url: "",
        templateUrl: "templates/home.html"
      })
      .state('add', {
        url: "/add",
        templateUrl: "templates/add.html",
        controller: "AddBookController"
      })
      .state('addmanually', {
        url: "/addmanually",
        templateUrl: "templates/add.manually.html",
        controller: "AddBookController"
      })
      .state('scan', {
        url: "/scan",
        templateUrl: "templates/scan.html"
      })
      .state('addoptions', {
        url: "/add/options",
        templateUrl: "templates/add.options.html"
      })
      .state('search', {
        url: "/book/search",
        templateUrl: "templates/search.html",
        controller: "BookController"
      })
      .state('searchresults', {
        url: "/search/results",
        templateUrl: "templates/search.results.html",
        controller: "SearchResults"
      })
      .state('noresults', {
        url: "/search/noresults",
        templateUrl: "templates/search.no_results.html",
        controller: "BookController"
      })
      .state('library', {
        url: "/library",
        templateUrl: "templates/library.html",
        controller: "LibraryController"
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('');

    databaseProvider.connect('testdb');


  });
  
  // bootstrap the angular applicaiton
  angular.bootstrap( document, ['ladders']);

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

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'ladders' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'ladders.services' is found in services.js
// 'ladders.controllers' is found in controllers.js
angular.module('ladders', ['ui.router','ladders.services', 'ladders.controllers'])


.config(function($stateProvider, $urlRouterProvider) {

  // Use AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    .state('home', {
      url: "",
      templateUrl: "templates/home.html"
    })
    .state('book', {
      url: "/book",
      templateUrl: "templates/book.html"
    })
    .state('add', {
      url: "/book/add",
      templateUrl: "templates/add.html",
      controller: "BookController"
    })
    .state('search', {
      url: "/book/search",
      templateUrl: "templates/search.html",
      controller: "BookController"
    })
    .state('searchresults', {
      url: "/search/results",
      templateUrl: "templates/search.results.html"
    })
    .state('noresults', {
      url: "/search/noresults",
      templateUrl: "templates/search.no_results.html",
      controller: "BookController"
    });



  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('');

});

document.addEventListener('deviceready', function(){
  angular.bootstrap( document, ['ladders']);
});


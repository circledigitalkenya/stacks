// angular.module is a global place for creating, registering and retrieving Angular modules
// 'stacks' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'stacks.services' is found in services.js
// 'stacks.controllers' is found in controllers.js

document.addEventListener('deviceready', function(){
  angular.module('stacks', [
      'ionic',
      'stacks.services',
      'stacks.controllers',
      'stacks.directives'
    ]
  )
  .config(function($urlRouterProvider, $stateProvider, databaseProvider) {

    // Use AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $urlRouterProvider.otherwise("/state1");

    $stateProvider
      .state('home', {
        url: "/home",
        templateUrl: "templates/home.html",
        data : {
          hasbackbutton : true
        }
      })
      .state('tab', {
        url: "/tab",
        templateUrl: "templates/tabs.html",
        data : {
          hasbackbutton : true
        }
      })
      .state('tab.build', {
        url: "/build",
        templateUrl: "templates/build_library.html",
        controller: "AddBookController",
        data : {
          hasbackbutton : true
        }
      })
      .state('tab.add', {
        url: "/add",
        templateUrl: "templates/add.html",
        controller: "AddBookController",
        data : {
          hasbackbutton : true
        }
      })
      .state('tab.addmanually',{
        url:"/addmanually",
        templateUrl: "templates/add.manually.html",
        controller: "AddBookController",
        data : {
          hasbackbutton : true
        }
      })
      .state('tab.book',{
        url:"/book/:id",
        templateUrl: "templates/book.html",
        controller: "BookController",
        data : {
          hasbackbutton : true
        }
      })
      .state('tab.search',{
        url:"/search",
        templateUrl: "templates/search.html",
        controller: "BookController",
        data : {
          hasbackbutton : true
        }
      })
      .state('tab.bookadded',{
        url:"/bookadded",
        templateUrl: "templates/book.added.html"
      })
      .state('tab.bookremoved',{
        url:"/bookremoved",
        templateUrl: "templates/book.removed.html",
        data : {
          hasbackbutton : false
        }
      })
      .state('tab.bookreturned',{
        url:"/bookreturned",
        templateUrl: "templates/book.returned.html",
        data : {
          hasbackbutton : false
        }
      })
      .state('tab.searchresults',{
        url:"/searchresults",
        templateUrl: "templates/search.results.html",
        controller: "SearchResults",
        data : {
          hasbackbutton : true
        }
      })
      .state('tab.no_results',{
        url:"/noresults",
        templateUrl: "templates/search.no_results.html",
        controller: "BookController",
        data : {
          hasbackbutton : true
        }
      })
      .state('tab.library',{
        url:"/library",
        templateUrl: "templates/library.html",
        controller: "LibraryController",
        data : {
          hasbackbutton : true
        }
      })
      .state('tab.contactlist',{
        url:"/contactlist",
        templateUrl: "templates/contact_list.html",
        controller: "LoanController",
        data : {
          hasbackbutton : true
        }
      })
      .state('tab.loans', {
        url: "/loans",
        templateUrl: "templates/loans.html",
        controller: function($scope, $rootScope, database){
          database
          .query("SELECT * FROM books WHERE loaned_date IS NOT NULL")
          .then(function(d){
            var len = d.length, books = [];
            for (var i = 0; i < len; i++) {
              var _loan_date = new Date(d[i].loaned_date);
              d[i].nice_loaned_date = _loan_date.getDay() +' '+ $rootScope.monthnames[_loan_date.getMonth()] +' '+_loan_date.getFullYear(); 
              books.push(d[i]);
            }
            $scope.books = books;
          });

          $scope.loanButtons = [
            {
              text: 'Return',
              type: 'button-calm',
              onTap: function(book) {
                $scope.returnBook(book.id);
              }
            }
          ];

        },
        data : {
          hasbackbutton : true
        }
      })
      .state('tab.scannoresults', {
        url:"/scannoresults",
        templateUrl: "templates/scan.no_results.html",
      })
      .state('tab.bookloaned',{
        url:"/bookloaned/:name",
        templateUrl: "templates/book.loaned.html",
        controller: function($scope,$stateParams){
          $scope.name = $stateParams.name
        },
        data : {
          hasbackbutton : false
        }
      });


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/home');


    // connect to the database
    databaseProvider.connect('stacks');


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

    $rootScope.allowed_to_access_contacts = false;

    $rootScope.monthnames = [ "January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December" ];

    $rootScope.amazon_affiliate_id = 'boap0d-20'
  })

  angular.bootstrap(document, ['stacks']);
})





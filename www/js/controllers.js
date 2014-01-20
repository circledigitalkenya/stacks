angular.module('ladders.controllers', [])

.controller('AddBookController', function($scope, $location, BookService, database){

    $scope.searchAmazon = function(){
        if( this.q ) {

          BookService
          .search_amazon(this.q)
          .then(
              function success(response, status,headers, config){
                if( response.data.status == 'success' && response.data.result.length > 0 ) {
                  BookService.setResults(response.data.result);
                  $location.path('/search/results');
                } else {
                  $location.path('/search/noresults');  // no results page
                }
              },
              function error(response, status,headers, config){
                  //notify alert, could not connect to remote server
              }
          );

        }
    }

    $scope.submitBook = function(){
      database.query(
        'INSERT INTO books( title, author, publisher, year, pages)' +
        ' VALUES'+
        '('+
          '"'+this.title +'",'+
          '"'+this.author +'",'+
          '"'+this.publisher +'",'+
          '"'+this.year +'",'+
          '"'+this.pages +'"'+
        ')'
      ).then(function(d){
        $location.path('/library');
      })


    }
})
.controller('SearchResults', function($scope,$location, BookService, database ){
    $scope.books = BookService.searchresults;

    $scope.addBook = function(isbn){

      BookService
      .search_amazon(isbn)
      .then(
          function success(response, status,headers, config){
              var  searchresults = [];
              if( response.data.status == 'success' ) {
                  database.query(
                    'INSERT INTO books( isbn, title, author, description, publisher, year, image, pages)' +
                    ' VALUES'+
                    '('+
                      '"'+response.data.result[0].isbn +'",'+
                      '"'+response.data.result[0].title +'",'+
                      '"'+response.data.result[0].author +'",'+
                      '"'+response.data.result[0].description +'",'+
                      '"'+response.data.result[0].publisher +'",'+
                      '"'+response.data.result[0].pubdate +'",'+
                      '"'+response.data.result[0].image +'",'+
                      '"'+response.data.result[0].pages +'"'+
                    ')'
                  ).then(function(d){
                    $location.path('/library');
                  })
              } else {
                // no results page
                $location.path('/noresults');
              }
          },
          function error(response, status,headers, config){
              //notify alert, could not connect to remote server
          }
      );
    }
})
.controller('LibraryController', function($scope, $location, database){

    // loop through the result set to create an object to pass to the template
    var books = database.query('SELECT * FROM books').then(function(d){

        var len = d.length;
        var books = [];

        for (var i=0; i<len; i++){
          books.push({
            isbn : d[i].isbn,
            author : d[i].author,
            title : d[i].title,
            image : d[i].image
          });
        }
        $scope.books = books;

    });




});

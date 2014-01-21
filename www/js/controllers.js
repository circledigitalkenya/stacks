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
.controller('SearchResults', function($scope,$location, BookService ){
  $scope.books = BookService.books;

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

})
.controller('BookController', function($scope, $location, $route, BookService, database){
  // is there a book set for viewing
  if($route.current.params.isbn ) {
    $scope.book = BookService.findByISBN($route.current.params.isbn);
  }

  $scope.addToLibrary = function(){
    database.query(
      'INSERT INTO books( isbn, title, author, description, publisher, year, image, pages)' +
      ' VALUES'+
      '('+
        '"'+$scope.book.isbn +'",'+
        '"'+$scope.book.title +'",'+
        '"'+$scope.book.author +'",'+
        '"'+$scope.book.description +'",'+
        '"'+$scope.book.publisher +'",'+
        '"'+$scope.book.pubdate +'",'+
        '"'+$scope.book.image +'",'+
        '"'+$scope.book.pages +'"'+
      ')'
    ).then(function(d){
      $location.path('/library');
    })    
  }


});

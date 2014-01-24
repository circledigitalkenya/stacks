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

    $scope.getAllbooks = function(){
      // loop through the result set to create an object to pass to the template
      return database
              .query('SELECT * FROM books')
              .then(function(d){
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
                $scope.books = books
              });      
    }

    $scope.getAllbooks();

    $scope.removeFromLibrary = function(isbn){
      database
      .query('DELETE FROM books WHERE isbn="'+isbn+'"')
      .then(function(d){
        // successfuly deleted book
        $scope.getAllbooks();
      })
    }
})
.controller('BookController', function($scope, $location, $route, BookService, database){
  // is there a book set for viewing
  if($route.current.params.isbn ) {
    $scope.book = BookService.findByISBN($route.current.params.isbn);
    // find out if the book is already in users library
    $scope.book.exists_in_library = false;

    database
    .query('SELECT isbn FROM books where isbn="'+$scope.book.isbn+'"')
    .then(function(data){
      if( data.length ) {
        $scope.book.exists_in_library = true;
      }
    })


  }

  $scope.addToLibrary = function(){
    database
      .query(
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
      )
      .then(function(d){
        $location.path('/library');
      })
      .catch(function(e){
        console.log(e)
      })   
  }


});

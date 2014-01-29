angular.module('ladders.controllers', [])

.controller('AddBookController', function($scope, $location, BookService, database){
    $scope.searchAmazon = function(q){
      var query = this.q || q;

      BookService
      .search_amazon(query)
      .then(
          function success(response, status,headers, config){
            if( response.data.status == 'success' && response.data.result.length > 0 ) {
              BookService.setResults(response.data.result); //cache the results
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

    $scope.submitBook = function(){
      database.query(
        'INSERT INTO books( isbn, title, author, publisher, year, pages)'+
        ' VALUES'+
        '('+
          '"'+this.isbn +'",'+
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

    /**
     * use the barcode scanner plugin to retreive books isbn
     *   
     * @param  bool amazon_search defaults to true, 
     *                            if this is false we search for the isbn in users library
     */
    $scope.scanBook = function(amazon_search){

      amazon_search = amazon_search || true;

      cordova.plugins.barcodeScanner.scan(
        function (result) {
          if( result.cancelled === 0 && result.format === 'EAN_13') {
            

            if( amazon_search ) {
              // search the book from amazon
              $scope
                .search_ISBN_From_Amazon(result.text)
                .then(function(response){
                  if( response ) {
                    $location
                      .path('/book')
                      .search({
                        isbn : result.text
                      });
                  } else {
                    $location.path('/scan/noresults')
                  }
                }); 

            } else {
              // search the book from users library
              $scope
                .search_ISBN_Locally(result.text)
                .then(function(response){
                  if( response ) {
                    // if its a single book, show the book view
                    $location
                      .path('/book')
                      .search({
                        isbn : result.text
                      });

                  } else {
                    // go to the scan/noresults page
                    $location.path('/scan/noresults')
                  }
                }); 

            }
          } else {
            $location.path('')
          }
        }, 
        function (error) {
          console.log("Scanning failed: " + error);
        }
      );
    }


    $scope.search_ISBN_Locally = function(isbn){
      return database
              .query('SELECT id,isbn FROM books where isbn = "'+isbn+'" LIMIT 0, 1')
              .then(function(data){
                if( data.length ) {
                  BookService.setResults(data); //cache the results in the service
                  return true;
                } else {
                  return false;
                }
              });
    }

    $scope.search_ISBN_From_Amazon = function(isbn){

      return BookService
              .search_amazon(isbn)
              .then(
                function success(response, status,headers, config){
                  if( response.data.status == 'success' && response.data.result.length > 0 ) {
                    BookService.setResults(response.data.result);
                    return true
                  } else {
                    return false
                  }
                }
              );

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
                    id : d[i].id,
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

    $scope.removeFromLibrary = function(id){
      database
      .query('DELETE FROM books WHERE id="'+id+'"')
      .then(function(d){
        // successfuly deleted book
        $scope.getAllbooks();
      })
    }
})
.controller('BookController', function($scope, $location, $route, BookService, database){
  // is there a book set for viewing
  if( $route.current.params.isbn ) {
    $scope.book = BookService.findByISBN($route.current.params.isbn);
    // find out if the book is already in users library
    $scope.book.exists_in_library = false;

    database
      .query('SELECT id,isbn FROM books where isbn = "'+$scope.book.isbn+'" LIMIT 0, 1')
      .then(function(data){
        if( data.length ) {
          $scope.book.id = data[0].id;
          $scope.book.exists_in_library = true;
        }
      })
  }

  $scope.addToLibrary = function(){
    database
      .query(
        'INSERT INTO books( isbn, title, author, description, publisher, year, image, pages, price)' +
        ' VALUES'+
        '('+
          '"'+$scope.book.isbn +'",'+
          '"'+$scope.book.title +'",'+
          '"'+$scope.book.author +'",'+
          '"'+$scope.book.description +'",'+
          '"'+$scope.book.publisher +'",'+
          '"'+$scope.book.pubdate +'",'+
          '"'+$scope.book.image +'",'+
          '"'+$scope.book.pages +'",'+
          '"'+$scope.book.price +'"'+
        ')'
      )
      .then(function(d){
        $location.path('/bookadded');
      })
      .catch(function(e){
        console.log(e)
      })   
  }

  $scope.removeFromLibrary = function(id){
    database
    .query('DELETE FROM books WHERE id="'+id+'"')
    .then(function(d){
      $location.path('/library'); // successfuly deleted book
    })
  }

});

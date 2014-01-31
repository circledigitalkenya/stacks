angular.module('stacks.controllers', [])

  .controller('AddBookController', function($scope, $q, $location, BookService, database) {

    $scope.working = false; // just toggling the loading indicator

    $scope.searchAmazon = function(q) {
      $scope.working = true;

      var query = this.q || q;
      
      BookService
        .search_amazon(query)
        .then(
          function success(response, status, headers, config) {
            if (response.data.status == 'success' && response.data.result.length > 0) {
              BookService.setResults(response.data.result); //cache the results
              $location.path('/search/results');
            } else {
              $location.path('/search/noresults'); // no results page
            }
          },
          function error(response, status, headers, config) {
            //notify alert, could not connect to remote server
          }
      );

    }

    $scope.submitBook = function() {
      database.query(
        "INSERT INTO books(title, author, publisher, pubdate, pages) " +
        "VALUES (" +
          "'"+this.title.replace(/[']/g, "''") +"',"+
          "'"+this.author.replace(/[']/g, "''") +"',"+
          "'"+this.publisher.replace(/[']/g, "''") +"',"+
          "'"+this.year +"',"+
          "'"+this.pages+"'"+
        ")"
      ).then(function(d) {
        $location.path('/bookadded');
      })
    }

    /**
     * use the barcode scanner plugin to retreive books isbn
     *
     * @param  bool amazon_search defaults to true,
     *                            if this is false we search for the isbn in users library
     */
    $scope.scanBook = function(amazon_search) {
      amazon_search = amazon_search || true;

      // the barcode scan is async, so we wrap it in an
      // angular promise then get the result,
      // without doing this $location.path won't work as it runs
      // before the scan is complete
      var asyncscan = function() {
        var deferred = $q.defer();
        cordova.plugins.barcodeScanner.scan(
          function(result) {
            if (result.cancelled === 0) {
              if (result.text.length > 0) {
                deferred.resolve(result.text)
              }
            }
          },
          function(error) {
            deferred.reject("Scanning failed: " + error);
          }
        );

        return deferred.promise;
      }

      promise = asyncscan(); //get the scan promise

      promise.then(function(ean) {
        // convert the raw EAN to ISBN
        var isbn = BookService.EAN_to_ISBN(ean);
        console.log('ean after conversion to isbn becomes: ' + isbn);

        if (isbn) {
          if (amazon_search) {
            $scope.working = true;
            
            // search the book from amazon
            $scope
              .search_ISBN_From_Amazon(isbn)
              .then(function(response) {
                if (response) {
                  $location
                    .path('/book')
                    .search({
                      isbn: isbn
                    });
                } else {
                  $location.path('/scan/noresults')
                }
              });
          } else {
            // search the book from users library
            $scope
              .search_ISBN_Locally(isbn)
              .then(function(response) {
                if (response) {
                  // if its a single book, show the book view
                  $location
                    .path('/book')
                    .search({
                      isbn: isbn
                    });

                } else {
                  // go to the scan/noresults page
                  $location.path('/scan/noresults')
                }
              });
          }
        } else {
          $location.path('/scan/noresults')
        }
      })

    }


    $scope.search_ISBN_Locally = function(isbn) {

      return database
        .query("SELECT id,isbn FROM books where isbn = '"+isbn+"' LIMIT 0, 1")
        .then(function(data) {
          if (data.length) {
            BookService.setResults(data); //cache the results in the service
            return true;
          } else {
            return false;
          }
        });
    }

    $scope.search_ISBN_From_Amazon = function(isbn) {

      return BookService
        .search_amazon(isbn)
        .then(
          function success(response, status, headers, config) {
            if (response.data.status == 'success' && response.data.result.length > 0) {
              BookService.setResults(response.data.result);
              return true
            } else {
              return false
            }
          }
      );

    }
  })

  .controller('SearchResults', function($scope, $location, BookService) {
    $scope.books = BookService.books;
  })

  .controller('LibraryController', function($scope, $location, database) {

    $scope.getAllbooks = function() {
      // loop through the result set to create an object to pass to the template
      return database
        .query('SELECT * FROM books')
        .then(function(d) {
          var len = d.length;
          var books = [];

          for (var i = 0; i < len; i++) {
            books.push({
              id: d[i].id,
              isbn: d[i].isbn,
              author: d[i].author,
              title: d[i].title,
              image: d[i].image
            });
          }
          $scope.books = books
        });
    }

    $scope.getAllbooks();

    $scope.removeFromLibrary = function(id) {
      database
        .query('DELETE FROM books WHERE id="' + id + '"')
        .then(function(d) {
          // successfuly deleted book
          $scope.getAllbooks();
        })
    }
  })

  .controller('BookController', function($scope, $location, $route, BookService, database) {
    // console.log('the isbn passed over to route is: ' + $route.current.params.isbn);

    // for the search results view which sends
    // the isbn as the unique identifier
    if ($route.current.params.isbn) {

      // find the book in cache
      $scope.book = BookService.findByISBN($route.current.params.isbn);

      if( $scope.book ) {
        // cache hit, find if this book already exists in our database
        database
          .query("SELECT id,isbn FROM books where isbn = '"+$route.current.params.isbn+"' LIMIT 0, 1")
          .then(function(data) {
            if (data.length) {
              $scope.book.id = data[0].id;
              $scope.book.exists_in_library = true;
              $scope.book.pubyear = new Date($scope.book.pubdate).getFullYear(); // extract the pub year for display only
            }
          })
      } else {
        // cache miss, find the book in our database
        database
          .query("SELECT * FROM books where isbn = '"+$route.current.params.isbn+"' LIMIT 0, 1")
          .then(function(data) {
            if (data.length) {
              $scope.book = data[0];
              $scope.book.exists_in_library = true;
              $scope.book.pubyear = new Date($scope.book.pubdate).getFullYear(); // extract the pub year for display only
            }
          })
      }

    } 

    // for the library view which sends the id as
    // the unique identifier
    if ($route.current.params.id) {
      // cache miss, find the book in our database
      database
        .query("SELECT * FROM books where id = '"+$route.current.params.id+"' LIMIT 0, 1")
        .then(function(data) {
          if (data.length) {
            $scope.book = data[0];
            $scope.book.exists_in_library = true;
            $scope.book.pubyear = new Date($scope.book.pubdate).getFullYear(); // extract the pub year for display only
          }
        })
    }

    $scope.addToLibrary = function() {
      database
        .query(
          "INSERT INTO books( isbn, title, author, description, publisher, pubdate, image, pages, price) "+
          "VALUES (" +
            "'"+$scope.book.isbn+"',"+ 
            "'"+$scope.book.title.replace(/[']/g, "''")+"',"+ 
            "'"+$scope.book.author.replace(/[']/g, "''")+"',"+ 
            "'"+$scope.book.description.replace(/[']/g, "''")+"',"+ 
            "'"+$scope.book.publisher+"',"+ 
            "'"+$scope.book.pubdate+"',"+ 
            "'"+$scope.book.image+"',"+ 
            "'"+$scope.book.pages+"',"+ 
            "'"+$scope.book.price+"'"+
          ")"
        )
        .then(function(d) {
          $location.path('/bookadded');
        })
    }

    $scope.removeFromLibrary = function(id) {
      database
        .query("DELETE FROM books WHERE id='"+id+"'")
        .then(function(d) {
          $location.path('/library'); // successfuly deleted book
        })
    }

  });
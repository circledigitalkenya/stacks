angular.module('stacks.controllers', [])
  .controller('MainController', function($scope, $window, $state, $rootScope, $q, $location, BookService, database) {
    // back button
    $rootScope.back = function(){
      $window.history.back();
    }
  })
  .controller('AddBookController', function($scope, $state, $rootScope, $q, $location, BookService, database) {

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
              $state.go('tab.searchresults');
            } else {
              $state.go('tab.noresults'); // no results page
            }
          },
          function error(response, status, headers, config) {
            //notify alert, could not connect to remote server
          }
      );

    }

    $scope.submitBook = function() {
      var book = {
        title : this.title || '',
        author : this.author || '',
        publisher : this.publisher || '',
        year : this.year || new Date().getFullYear(),
        pages : this.pages || '',
      };

      database.query(
        "INSERT INTO books(title, author, publisher, pubyear, pages) " +
        "VALUES (" +
          "'"+book.title.replace(/[']/g, "''") +"',"+
          "'"+book.author.replace(/[']/g, "''") +"',"+
          "'"+book.publisher.replace(/[']/g, "''") +"',"+
          "'"+book.year +"',"+
          "'"+book.pages+"'"+
        ")"
      ).then(function(d) {
        $state.go('tab.bookadded');
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
      // without doing this $state.go won't work as it runs
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
                  $state
                    .go('tab.book')
                    .data({
                      isbn: isbn
                    });
                } else {
                  $state.go('tab.scannoresults')
                }
              });
          } else {
            // search the book from users library
            $scope
              .search_ISBN_Locally(isbn)
              .then(function(response) {
                if (response) {
                  // if its a single book, show the book view
                  $state
                    .go('tab.book')
                    .data({
                      isbn: isbn
                    });

                } else {
                  // go to the scan/noresults page
                  $state.go('tab.scannoresults')
                }
              });
          }
        } else {
          $state.go('tab.scannoresults')
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

  .controller('SearchResults', function($scope, $state, $location, BookService) {
    $scope.books = BookService.books;
  })

  .controller('LibraryController', function($scope, $state, $rootScope, $location, database) {

    database
      .query('SELECT * FROM books')
      .then(function(d) {
        var len = d.length;
        var books = [];

        for (var i = 0; i < len; i++) {
          var _loan_date = new Date(d[i].loaned_date);
          d[i].nice_loaned_date = _loan_date.getDay() +' '+ $rootScope.monthnames[_loan_date.getMonth()] +' '+_loan_date.getFullYear(); 
          books.push(d[i]);
        }
        
        $scope.books = books
      });

  })

  .controller('BookController', function($scope, $rootScope, $state, $location, $stateParams, BookService, database) {

    // param id can be either the ISBN or book id
    if ($stateParams.id) {

      // find the book in cache
      $scope.book = BookService.findByISBN($stateParams.id);
      
      if( $scope.book ) {
        // cache hit, find out if this book already exists in our database
        database
          .query("SELECT * FROM books where id = '"+$stateParams.id+"' OR isbn = '"+$stateParams.id+"' LIMIT 0, 1")
          .then(function(data) {
            if (data.length) {
              $scope.book.id = data[0].id;
              $scope.book.exists_in_library = true;
              $scope.book.yearpublished = new Date($scope.book.pubdate).getFullYear();
              if( $scope.book.loaned_date ) {
                var _loan_date = new Date($scope.book.loaned_date);
                $scope.book.nice_loaned_date = _loan_date.getDay() +' '+ $rootScope.monthnames[_loan_date.getMonth()] +' '+_loan_date.getFullYear(); 
              }
            }
          })

      } else {
        // cache miss, find the book in our database
        database
          .query("SELECT * FROM books WHERE id = '"+$stateParams.id+"' OR isbn = '"+$stateParams.id+"' LIMIT 0, 1")
          .then(function(data) {
            if (data.length) {
              $scope.book = data[0];
              $scope.book.exists_in_library = true;
              $scope.book.yearpublished = new Date($scope.book.pubdate).getFullYear(); // extract the pub year for display only
              if( $scope.book.loaned_date ) {
                var _loan_date = new Date($scope.book.loaned_date);
                $scope.book.nice_loaned_date = _loan_date.getDay() +' '+ $rootScope.monthnames[_loan_date.getMonth()] +' '+_loan_date.getFullYear(); 
              }
            }
          })
      }

    } 

    $scope.addToLibrary = function() {
      database
        .query(
          "INSERT INTO books( isbn, title, author, description, publisher, pubdate, pubyear, image, pages, price) "+
          "VALUES (" +
            "'"+$scope.book.isbn+"',"+ 
            "'"+$scope.book.title.replace(/[']/g, "''")+"',"+ 
            "'"+$scope.book.author.replace(/[']/g, "''")+"',"+ 
            "'"+$scope.book.description.replace(/[']/g, "''")+"',"+ 
            "'"+$scope.book.publisher+"',"+ 
            "date('"+$scope.book.pubdate+"'),"+ 
            "strftime('%Y','"+$scope.book.pubdate+"'),"+ 
            "'"+$scope.book.image+"',"+ 
            "'"+$scope.book.pages+"',"+ 
            "'"+$scope.book.price+"'"+
          ")"
        )
        .then(function(d) {
          $state.go('tab.bookadded');
        })
    }

    $scope.removeFromLibrary = function(id) {
      database
        .query("DELETE FROM books WHERE id='"+id+"'")
        .then(function(d) {
          $state.go('tab.library'); // successfuly deleted book
        })
    }

    $scope.loanBook = function(bookid){
      
      // we already requested contact permissions from our config.xml
      // but here we just want to inform the user on why we need access
      // to contacts, if user clicks cancel,nothing happens
      // show this dialog only once
      if( ! $rootScope.allowed_to_access_contacts ) {
        // do dialog, and list all contacts
        navigator.notification.confirm(
          'We use your contacts just so you don\'t have to type in names.',
          function(buttonindex){
            if( buttonindex === 1){
              $rootScope.allowed_to_access_contacts = true;
              BookService.current_book_id = bookid; // copy the current book id to service since services persist data across the app
              $state.go('tab.contactlist');
            }
          },
          'Allow app to access contacts',
          ['Allow','Cancel']
        );        
      } else {
        $state.go('tab.contactlist');
      }

    }


  })
  .controller('LoanController', function($scope, $state, $location, BookService, ContactService, database){

    ContactService
      .findAll()
      .then(function(contacts){
        var nice_contacts = [];
        for (var i = 0; i < contacts.length; i++) {
          nice_contacts.push({
            id : contacts[i].id,
            name : contacts[i].displayName
          })
        }
        $scope.contacts = nice_contacts;

      }, function(e){
        console.log('Error: Failed to get the contacts!')
      });

    $scope.loanToContact = function(contactid, contactname){

      database
        .query(
          "UPDATE books SET "+ 
          "loaned_to_contact_id = '"+contactid+"',"+
          "loaned_to_contact_name = '"+contactname+"',"+
          "loaned_date = date('now') "+
          "WHERE id='"+BookService.current_book_id+"'"
        )
        .then(function(){
          $state.go('tab.bookloaned', { name : contactname });
        }, function(error){
          //query failed
          console.log('query failed due to: '+ error)
        })
    }


  });
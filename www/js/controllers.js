angular.module('stacks.controllers', [])
  .controller('MainController', function($scope, $window, $state, $rootScope, $q, $location, BookService, database) {

    
    // hide the back button if we are from a page where 
    // it was already hidden, otherwise render the default behaviour
    $rootScope.hasbackbutton = $state.current.data.hasbackbutton
    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams){
      if( fromState.data.hasbackbutton === false) {
        $rootScope.hasbackbutton = false;
      } else {
        $rootScope.hasbackbutton = toState.data.hasbackbutton;
      }
    });

    // back button
    $rootScope.back = function(){
      $window.history.back();
    }

    $scope.slide = 'slide-left';

    $rootScope.working = false; // just toggling the loading indicator

    // shared methods
    $scope.loanBook = function(bookid){
      BookService.current_book_id = bookid; // copy the current book id to service since services persist data across the app

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

    $scope.returnBook = function(id) {
      database
        .query("UPDATE books SET loaned_to_contact_id ='', loaned_to_contact_name = '', loaned_date = '' WHERE id='"+id+"'")
        .then(function(d) {
          $state.go('tab.bookreturned');
        })
    }


  })
  .controller('AddBookController', function($scope, $state, $rootScope, $q, $location, BookService, database) {

    $rootScope.searchAmazon = function(q, page) {
      q = this.q || q // query can be from a form or from params

      page = page || 1; //default to first page

      $scope.working = true;
      
      BookService
        .search_amazon(q, page)
        .then(
          function success(response, status, headers, config) {
            $scope.working = false;
            if (response.data.status == 'success' && response.data.books.length > 0) {
              BookService.books = response.data.books; //cache the results
              BookService.hasmore = response.data.hasmore; // are there are more books
              BookService.nextpage = response.data.nextpage; // are there are more books
              BookService.query = response.data.query; // are there are more books

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
        year : this.year || '',
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

        if (isbn) {
          $scope.working = true;
          // search the book from amazon
          BookService
            .search_amazon(isbn)
            .then(
              function success(response, status, headers, config) {
                $scope.working = false;
                if (response.data.status == 'success' && response.data.books.length > 0) {
                  BookService.books = response.data.books;
                  $state.go('tab.book', { id : isbn });
                } else {
                  $state.go('tab.scannoresults');
                }
              },
              function(){
                $state.go('tab.scannoresults');
              }
            )
        } else {
          $state.go('tab.scannoresults')
        }
      })

    }
  })

  .controller('SearchResults', function($scope, $state, $location, BookService) {
    $scope.q = BookService.query;
    $scope.hasmore = BookService.hasmore;
    $scope.books = BookService.books;
    $scope.nextpage = BookService.nextpage;

    $scope.loadMoreResults = function(q, page){
      $scope.working = true;
      BookService
        .search_amazon(q, page)
        .then(
          function success(response, status, headers, config) {
            $scope.working = false;
            if (response.data.status == 'success' && response.data.books.length > 0) {
              $scope.books = $scope.books.concat(response.data.books);
              $scope.hasmore = response.data.hasmore;
              $scope.nextpage = response.data.nextpage;
            }
          }
        )
    }

  })

  .controller('LibraryController', function($scope, $state, $rootScope, $location, database) {

    database
      .query('SELECT * FROM books')
      .then(function(d) {
        var len = d.length;
        var books = [];

        for (var i = 0; i < len; i++) {
          var _loan_date = new Date(d[i].loaned_date);
          d[i].nice_loaned_date = _loan_date.getDate() +' '+ $rootScope.monthnames[_loan_date.getMonth()] +' '+_loan_date.getFullYear(); 
          books.push(d[i]);
        }
        
        $scope.books = books
      });

    $scope.libButtons = [
      {
        text: 'Loan',
        type: 'button-calm',
        onTap: function(book) {
          $scope.loanBook(book.id);
        }
      }
    ];

  })

  .controller('BookController', function($scope, $rootScope, $state, $location, $stateParams, BookService, database) {

    // param id can be either the Hash or book id
    if ($stateParams.id) {

      // find the book in cache
      $scope.book = BookService.findByHash($stateParams.id);
      
      if( $scope.book ) {
        // cache hit, find out if this book already exists in our database
        database
          .query("SELECT * FROM books where isbn = '"+$scope.book.isbn+"' LIMIT 0, 1")
          .then(function(data) {
            if (data.length) {
              $scope.book.id = data[0].id;
              $scope.book.exists_in_library = true;
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
              if( $scope.book.loaned_date ) {
                var _loan_date = new Date($scope.book.loaned_date);
                $scope.book.nice_loaned_date = _loan_date.getDay() +' '+ $rootScope.monthnames[_loan_date.getMonth()] +' '+_loan_date.getFullYear(); 
              }
            }
          })
      }

    } 

    $scope.buyBook = function(url){
      window.open(url, '_blank', 'location=yes,closebuttoncaption=back,toolbar=yes');
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
            "'"+$scope.book.pubyear+"',"+ 
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
          $state.go('tab.bookremoved'); // successfuly removed book
        })
    }

  })
  .controller('LoanController', function($scope, $state, $location, BookService, ContactService, database){

    ContactService
      .findAll()
      .then(function(contacts){
        // create a contact list
        // of unique names only
        var nice_contacts = [], _names = [];
        for (var i = 0; i < contacts.length; i++) {
          if( _names.indexOf(contacts[i].displayName.toLowerCase()) === -1 ) {
            _names.push(contacts[i].displayName.toLowerCase());

            nice_contacts.push({
              id : contacts[i].id,
              name : contacts[i].displayName
            })            
          }
        }

        // sort in alphabetical order
        nice_contacts.sort(function (a, b) {
          if (a.name > b.name)
            return 1;
          if (a.name < b.name)
            return -1;
          // a must be equal to b
          return 0;
        });

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
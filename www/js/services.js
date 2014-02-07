angular.module('stacks.services', [])
  .factory('BookService', function($http) {

    var current_book_id;

    return {

      books : [],

      search_amazon: function(q) {
        return $http.get('http://circle.co.ke/amazon/?q=' + q);
      },
      setResults: function(results) {
        this.books = results
      },

      findByISBN: function(isbn) {
        for (var i = 0; i < this.books.length; i++) {
          if (this.books[i].isbn == isbn) {
            return this.books[i];
          }
        }
      },

      /**
       * Converts an EAN_10 or EAN_13 barcode value
       * to ISBN
       *
       * example: this EAN_13 value 9780596527679 will be
       * converted to isbn 0596527675
       * @return {String|Bool} an isbn if successful, false if not succesful
       */
      EAN_to_ISBN: function(isbn) {

        var isbn10exp = /^\d{9}[0-9X]$/;
        var isbn13exp = /^\d{13}$/;
        var isbnlen = isbn.length;
        var total = 0;

        if (isbnlen == 0) {
          return false; // no isbn was found
        }

        if (!(isbn10exp.test(isbn)) && !(isbn13exp.test(isbn))) {
          // console.log("This ISBN is invalid." + "\n" +"It contains invalid characters.");
          return false;
        }

        // Validate & convert a 10-digit ISBN
        if (isbnlen == 10) {

          // Test for 10-digit ISBNs:
          // Formulated number must be divisible by 11
          // 0234567899 is a valid number
          for (var x = 0; x < 9; x++) {
            total = total + (isbn.charAt(x) * (10 - x));
          }

          // check digit
          z = isbn.charAt(9);
          if (z == "X") {
            z = 10;
          }

          // validate ISBN
          if ((total + z * 1) % 11 != 0) { // modulo function gives remainder
            z = (11 - (total % 11)) % 11;
            if (z == 10) {
              z = "X";
            }
            // console.log("This 10-digit ISBN is invalid." + "\n" + "The check digit should be " + z + ".");
            return false;
          } else {
            // convert the 10-digit ISBN to a 13-digit ISBN
            isbn = "978" + isbn.substring(0, 9);
            total = 0;
            for (var x = 0; x < 12; x++) {
              if ((x % 2) == 0) {
                y = 1;
              } else {
                y = 3;
              }
              total = total + (isbn.charAt(x) * y);
            }
            z = (10 - (total % 10)) % 10;
          }
        }

        // Validate & convert a 13-digit ISBN
        else {
          // Test for 13-digit ISBNs
          // 9780234567890 is a valid number
          for (var x = 0; x < 12; x++) {
            if ((x % 2) == 0) {
              y = 1;
            } else {
              y = 3;
            }
            total = total + (isbn.charAt(x) * y);
          }

          // check digit
          z = isbn.charAt(12);

          // validate ISBN        
          if ((10 - (total % 10)) % 10 != z) { // modulo function gives remainder
            z = (10 - (total % 10)) % 10;
            // console.log("This 13-digit ISBN is invalid." + "\n" + "The check digit should be " + z + ".");
            return false;
          } else {
            // convert the 13-digit ISBN to a 10-digit ISBN
            if ((isbn.substring(0, 3) != "978")) {
              // console.log("This 13-digit ISBN does not begin with \"978\"" + "\n" + "It cannot be converted to a 10-digit ISBN.");
              return false;
            } else {
              isbn = isbn.substring(3, 12);
              total = 0;
              for (var y = 0; y < 9; y++) {
                total = total + (isbn.charAt(y) * (10 - y));
              }
              z = (11 - (total % 11)) % 11;
              if (z == 10) {
                z = "X";
              }
            }
          }
        }

        return isbn + z;
      }

    }
  })
  .factory('ContactService', function($q) {

    var contacts;

    return {

      // fetch all contacts
      // returns a promise since contacts.find is async
      findAll : function(){

        var deferred = $q.defer();

        // find all contacts
        var options = new ContactFindOptions();
        options.filter = "";
        var filter = ["displayName", "addresses"];
        navigator.contacts.find(filter, deferred.resolve, deferred.reject, options);

        return deferred.promise;
      }
    }
  })
  .provider('database', function() {
    var _self = this;

    this.connect = function(name) {
      if (_self.isOnDevice()) {
        _self.db = window.sqlitePlugin.openDatabase(name, "1.0", "Demo", -1);
      } else {
        // fallback to websql if testing on web
        _self.db = window.openDatabase(name, "1.0", "Demo", -1);
      }

      _self.setupTables();
    };

    this.setupTables = function() {

      this.db.transaction(function(tx) {

        // @todo: remove this line in production
        tx.executeSql("DROP TABLE IF EXISTS books"); // only for debugging purposes, setup a fresh table on each app launch

        tx.executeSql(

          "CREATE TABLE IF NOT EXISTS books("+
            "id INTEGER PRIMARY KEY AUTOINCREMENT,"+
            "isbn TEXT,"+
            "title TEXT,"+
            "description TEXT,"+
            "image TEXT,"+
            "author TEXT,"+
            "publisher TEXT,"+
            "pubdate TEXT,"+
            "pubyear TEXT,"+
            "pages TEXT,"+
            "price TEXT,"+
            "loaned_to_contact_name TEXT,"+
            "loaned_to_contact_id TEXT,"+
            "loaned_date TEXT"+
          ")"
        );

      });

      //seed
      this.db.transaction(function(tx){
        tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0435905554","So Long a Letter","Mariama Ba")');
        tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0007189885","Purple Hibiscus","Chimamanda Ngozi Adichie")');
        tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0307961206","Dust","Yvonne Adhiambo Owuor")');
        tx.executeSql('INSERT INTO books(isbn, title, author, loaned_to_contact_id,loaned_to_contact_name, loaned_date) VALUES("0262620200","History and Class Consciousness: Studies in Marxist Dialectics","YGyorgy Lukacs", "1", "John Doe",date(\'now\'))');
      });


    };

    /**
     * Returns true if the application is running on an actual mobile device.
     */
    this.isOnDevice = function() {
      return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
    }

    this.$get = ['$q',
      function($q) {
        return {
          // much of this is borrowed from
          // http://stackoverflow.com/questions/20736214/trying-to-get-an-async-db-request-to-work-in-angular-cannot-call-method-then-o
          query: function(query) {

            var deferred = $q.defer();

            _self.db.transaction(function(transaction) {
              transaction.executeSql(query, [], function(transaction, result) {
                var resultObj = {},
                  responses = [];
                if (result !== null && result.rows !== null) {
                  for (var i = 0; i < result.rows.length; i++) {
                    resultObj = result.rows.item(i);
                    responses.push(resultObj);
                  }
                } else {
                  resultObj.snip = "No results for " + query;
                  responses.push(resultObj)
                }

                deferred.resolve(responses); //at the end of processing the responses
              }, _self.defaultNullHandler, _self.defaultErrorHandler);
            });

            return deferred.promise; // Return the promise to the controller
          },

          db: _self.db,

          defaultNullHandler: function() {
            console.log('default handler: ');
          },

          defaultErrorHandler: function(e) {
            console.log('An error occured: ' + e);
          }
        }

      }
    ]

  })
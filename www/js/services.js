angular.module('ladders.services', [])

.factory('BookService', function($http){
    return {
        search_amazon : function(q){
            return $http.get('http://localhost/amazon/?q='+q);
        },
        setResults : function(results){
            this.searchresults = results
        }
    }
})

.provider('database', function (){
    var _self = this;

    this.connect = function(name) {
        if( _self.isOnDevice() ) {
          _self.db = window.sqlitePlugin.openDatabase(name, "1.0", "Demo", -1);
        } else {
          // fallback to websql if testing on web
          _self.db = window.openDatabase(name, "1.0", "Demo", -1);
        }
      
        _self.setupTables();
    };

    this.setupTables = function(){

        this.db.transaction(function(tx){

          // @todo: remove this line in production
          tx.executeSql('DROP TABLE IF EXISTS books'); // only for debugging purposes, setup a fresh table on each app launch
          
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS books'+
            '('+
              'id INTEGER PRIMARY KEY AUTOINCREMENT,'+
              'isbn TEXT,'+
              'title TEXT,'+
              'description TEXT,'+
              'image_path TEXT,'+
              'author TEXT,'+
              'publisher TEXT,'+
              'year TEXT,'+
              'pages TEXT'+ 
            ')'
          );

        });
        
    };

    /**
     * Returns true if the application is running on an actual mobile device.
     */
    this.isOnDevice = function(){
        return navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
    }

    this.$get = ['$q', function($q){
      return {
        seed  : function(){

          _self.db.transaction(function(tx){
            tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0435905554","So Long a Letter","Mariama Ba")');
            tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0007189885","Purple Hibiscus","Chimamanda Ngozi Adichie")');
            tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0307961206","Dust","Yvonne Adhiambo Owuor")');
            tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0262620200","History and Class Consciousness: Studies in Marxist Dialectics","YGyorgy Lukacs")');
          });

        },

        // much of this is borrowed from
        // http://stackoverflow.com/questions/20736214/trying-to-get-an-async-db-request-to-work-in-angular-cannot-call-method-then-o
        query : function(query){

          var deferred = $q.defer();

          _self.db.transaction(function(transaction) {
              transaction.executeSql(query,[], function(transaction, result) {
                  var resultObj = {},
                      responses = [];
                  if (result != null && result.rows != null) {
                      for (var i = 0; i < result.rows.length; i++) {
                          resultObj = result.rows.item(i);
                          responses.push(resultObj);
                      }
                  } else {
                      resultObj.snip = "No results for " + query;
                      responses.push(resultObj)
                  }

                  deferred.resolve(responses); //at the end of processing the responses
              },_self.defaultNullHandler,_self.defaultErrorHandler);
          });

          return deferred.promise; // Return the promise to the controller
        },

        db : _self.db,

        defaultNullHandler : function(){
          console.log('default handler: ');
        },

        defaultErrorHandler : function(e){
          console.log('An error occured: '+e);
        }
      }

    }]

})
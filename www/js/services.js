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

.factory('DatabaseService', function(db){
    return {
        seed : function(){
            console.log('seeding');

            db.transaction(function(tx){
              tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0435905554","So Long a Letter","Mariama Ba")');
              tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0007189885","Purple Hibiscus","Chimamanda Ngozi Adichie")');
              tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0307961206","Dust","Yvonne Adhiambo Owuor")');
              tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0262620200","History and Class Consciousness: Studies in Marxist Dialectics","YGyorgy Lukacs")');
            })
        }
    }
});

angular.module('ladders.providers', [])
.provider('DataProvider', function (){

    this.connect = function(name) {
        this.db = window.openDatabase(name, "1.0", "Demo", -1); // replace with window.sqlitePlugin.openDatabase to enable the sqlite plugin
        this.setup()
    }

    this.setup = function(){

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

        })
    }
    // we can inject a service or factory in the  "$get" method.
    // https://gist.github.com/Mithrandir0x/3639232
    this.$get = ['DatabaseService', function(DatabaseService) {
        return new DatabaseService(this.db);
    }];


});
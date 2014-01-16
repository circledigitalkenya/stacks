angular.module('ladders.providers', [])

.provider('database', function (){

    this.connect = function(name) {
        this.db = window.openDatabase(name, "1.0", "Demo", -1); // replace with window.sqlitePlugin.openDatabase to enable the sqlite plugin
        this.setupTables();
    };

    this.setupTables = function(){

        this.db.transaction(function(tx){

          // @todo: remove this line in production
          // tx.executeSql('DROP TABLE IF EXISTS books'); // only for debugging purposes, setup a fresh table on each app launch
          
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

    // we can inject a service or factory in the  "$get" method.
    // https://gist.github.com/Mithrandir0x/3639232
    this.$get = ['DataService', function(DataService) {
        return new DataService(this.db);
    }];


});
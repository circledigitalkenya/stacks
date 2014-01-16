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

.factory('DataService', function(db){
    return {
        seed : function(){
            console.log('seeding');

            db.transaction(function(tx){
              tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0435905554","So Long a Letter","Mariama Ba")');
              tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0007189885","Purple Hibiscus","Chimamanda Ngozi Adichie")');
              tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0307961206","Dust","Yvonne Adhiambo Owuor")');
              tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0262620200","History and Class Consciousness: Studies in Marxist Dialectics","YGyorgy Lukacs")');
            })
        },
        query : function(){
            db.transaction(function(tx){
              tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0435905554","So Long a Letter","Mariama Ba")');
              tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0007189885","Purple Hibiscus","Chimamanda Ngozi Adichie")');
              tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0307961206","Dust","Yvonne Adhiambo Owuor")');
              tx.executeSql('INSERT INTO books(isbn, title, author) VALUES("0262620200","History and Class Consciousness: Studies in Marxist Dialectics","YGyorgy Lukacs")');
            })
        }
    }
});


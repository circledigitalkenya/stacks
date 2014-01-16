angular.module('ladders.controllers', [])

.controller('AddBookController', function($scope,$state, BookService, DataService){

    $scope.searchAmazon = function(){

        if( this.q ) {

            BookService
            .search_amazon(this.q)
            .then(
                function success(response, status,headers, config){
                    var  searchresults = [];
                    if( response.data.status == 'success' ) {
                        if( response.data.result.TotalResults == 1 ) {
                            searchresults.push(response.data.result.Item);
                        } else {
                            searchresults = response.data.result.Item;
                        }
                        BookService.setResults(searchresults);

                        $state.go('searchresults');
                    } else {
                        // no results page
                        $state.go('noresults');
                    }
                },
                function error(response, status,headers, config){
                    //notify alert, could not connect to remote server
                }
            );

        }
    }

    $scope.submitBook = function(){
        DataService.seed();
        
        angular.db.transaction(
            function(tx){
              tx.executeSql(
                'INSERT INTO books( title, author, publisher, year, pages)' +
                ' VALUES'+
                '('+
                  '"'+this.title +'",'+
                  '"'+this.author +'",'+
                  '"'+this.publisher +'",'+
                  '"'+this.year +'",'+
                  '"'+this.pages +'",'+
                ')'
              );
            }
        );

        $state.go('library');
    }
})
.controller('SearchResults', function($scope, BookService){
    $scope.books = BookService.searchresults;
})
.controller('LibraryController', function($scope){
    $scope.books = [];
    angular.db.transaction(function(tx){
        tx.executeSql('SELECT * FROM books', [], function(tx, results){
          // loop through the result set to create an object to pass to the template
          var books = [];
          var len = results.rows.length;

          for (var i=0; i<len; i++){
            books.push({
              isbn : results.rows.item(i).isbn,
              author : results.rows.item(i).author,
              title : results.rows.item(i).title,
              image_path : results.rows.item(i).image_path
            });
          }

          $scope.books = books;
          $scope.name = "Hello"

        }, function(e){ 
          console.log("ERROR: " + e.message);
        });
    },
    function(e){ 
        console.log("ERROR: " + e.message);
    });
});

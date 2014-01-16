angular.module('ladders.controllers', [])

.controller('AddBookController', function($scope,$state, BookService, database){

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

      database.query(
        'INSERT INTO books( title, author, publisher, year, pages)' +
        ' VALUES'+
        '('+
          '"'+this.title +'",'+
          '"'+this.author +'",'+
          '"'+this.publisher +'",'+
          '"'+this.year +'",'+
          '"'+this.pages +'"'+
        ')'
      ).then(function(d){
        console.log('got a response');
        $state.go('library');
      })


    }
})
.controller('SearchResults', function($scope, BookService){
    $scope.books = BookService.searchresults;
})
.controller('LibraryController', function($scope, database){

    // loop through the result set to create an object to pass to the template
    var books = database.query('SELECT * FROM books').then(function(d){

    var len = d.length;
    var books = [];

    for (var i=0; i<len; i++){
      books.push({
        isbn : d[i].isbn,
        author : d[i].author,
        title : d[i].title,
        image_path : d[i].image_path
      });
    }
    $scope.books = books;

  });




});

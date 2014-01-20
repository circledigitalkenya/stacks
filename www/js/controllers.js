angular.module('ladders.controllers', [])

.controller('AddBookController', function($scope, $location, BookService, database){

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

                        $location.path('/search/results');
                    } else {
                        // no results page
                        $location.path('/search/noresults');
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
        $location.path('/library');
      })


    }
})
.controller('SearchResults', function($scope,$location, BookService,database){
    $scope.books = BookService.searchresults;

    $scope.addBook = function(isbn){

      BookService
      .search_amazon(isbn)
      .then(
          function success(response, status,headers, config){
              var  searchresults = [];
              if( response.data.status == 'success' ) {
                  database.query(
                    'INSERT INTO books( title, author, publisher, year, pages)' +
                    ' VALUES'+
                    '('+
                      '"'+  .data.result.Item.ItemAttributes.Title +'",'+
                      '"'+response.data.result.Item.ItemAttributes.Author +'",'+
                      '"'+response.data.result.Item.ItemAttributes.Publisher +'",'+
                      '"'+response.data.result.Item.ItemAttributes.ReleaseDate +'",'+
                      '"'+response.data.result.Item.ItemAttributes.NumberOfPages +'"'+
                    ')'
                  ).then(function(d){
                    console.log('got a response');
                    $location.path('/library');
                  })
              } else {
                  // no results page
                  $location.path('/noresults');
              }
          },
          function error(response, status,headers, config){
              //notify alert, could not connect to remote server
          }
      );
    }
})
.controller('LibraryController', function($scope, $location, database){

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

angular.module('ladders.controllers', [])

.controller('BookController', function($scope,$state, BookService){
    $scope.searchresults = [];
    
    $scope.searchAmazon = function($state){
        if( this.q ) {
            BookService
            .search_amazon(this.q)
            .success(function(data, status,headers, config){
                if( response.status == 'success' ) {
                    //return response.data;
                    $state.go('searchresults');
                } else {
                    // no results page
                    $state.go('noresults');
                }
            })
            .error(function(data, status,headers, config){
                //notify alert, could not connect to remote server
            })
        }
    }

});

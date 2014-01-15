angular.module('ladders.controllers', [])

.controller('BookController', function($rootScope,$scope,$state, BookService){
    $rootScope.searchresults = [];


    $scope.searchAmazon = function(){
        if( this.q ) {
            BookService
            .search_amazon(this.q)
            .then(
                function success(response, status,headers, config){
                    if( response.data.status == 'success' ) {
                        $rootScope.searchresults = response.data.result.Item;
                        $state.go('searchresults');
                    } else {
                        // no results page
                        $state.go('noresults');
                    }
                },
                function error(response, status,headers, config){
                    //notify alert, could not connect to remote server
                }
            )

        }
    }

});

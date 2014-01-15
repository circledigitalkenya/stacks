angular.module('ladders.services', [])

.factory('BookService', function(){

    return {
        search_amazon : function(q){
            return $http
                .get('http://localhost/amazon/?q='+q);
        }
    }
    
})
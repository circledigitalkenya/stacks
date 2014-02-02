
function ryantest($scope) {
  $scope.moveit = function() {
      // var target = angular.element(document.getElementById('thingy'));

      $('#thingy').toggleClass('wrap');
      $('#thingy2').toggleClass('wrap');
  };
};
angular
  .module('gitphaser')
  .filter('proximityFilter', proximityFilter)
  .filter('timeFilter', timeFilter)
  .filter('dateFilter', dateFilter);
 
function proximityFilter ($rootScope) {
  return function (proximity) {
  	if ($rootScope.DEV || !proximity) return proximity;
    var distance = proximity.substring(9);
    return "Proximity: " + distance;
  };
};

function timeFilter () {
  return function (time) {
    if (!time) return;
    return moment(time).fromNow();
  };
};

function dateFilter(){
  return function (time) {
    if (!time) return;
    return moment(time).format('MMM D');
  };
}
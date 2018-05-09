var watchID = null;
var options = { timeout: 40000, enableHighAccuracy: true };

var success = function(pos) {};

var failw = function(error) {};

watchID = navigator.geolocation.watchPosition(success, failw, options);
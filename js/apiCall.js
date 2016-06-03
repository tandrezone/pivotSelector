app.factory('apiCall', function($http, $q) {
  var getResponse = function(){
    var deferred = $q.defer();
    $http.get('json/response.json').success(function (response) {
        deferred.resolve(response);
    });
  return deferred.promise;  
  }

    return {
        getResponse: getResponse,

    };
});

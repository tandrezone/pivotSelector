app.factory('apiCall', function($http, $q) {
  var getResponse = function(){
    var deferred = $q.defer();
    $http.get('json/response.json').success(function (response) {
        deferred.resolve(response);
    });
  return deferred.promise;
  }

  var getCategories = function () {
      var deferred = $q.defer();
      $http.get('json/pivotset.json').success(function (response) {
          deferred.resolve(response);
      });
      return deferred.promise;
  }
  cleanReq = null;
  var genRequest = function (data) {
      if (cleanReq == null) {
          cleanReq =  [{ "category": "columns", "elements": [] }, { "category": "lines", "elements": [] }, { "category": "metrics", "relation": "", "elements": [] }];
      }
      if (data.type == 'metrics') {
          cleanReq[2].relation = data.relation;
      }
      _recClean(data, data.elements, cleanReq);

  }
  var _recClean = function (data, request, cleanReq) {
      for (var a = 0; a < request.length; a++) {
          switch (data.type) {
              case 'columns':
                  b = 0;
                  break;
              case 'lines':
                  b = 1;
                  break;
              case 'metrics':
                  b = 2;
                  break;
          }
          cleanReq[b].elements.push({ "name": request[a].name, "type": request[a].vartype, "elements":[] });
          if (data.type != 'metrics') {
              if (request[a].elements.length != 0) {
                  _recClean(request[a],request[a].elements, cleanReq[b].elements);
              }
          }
      }
      _sendRequest(cleanReq);
  }
  var _sendRequest =function(req){
      if (req[0].elements.length != 0 && req[1].elements.length != 0 && req[2].elements.length != 0) {
          console.log(JSON.stringify(req));
          alert(JSON.stringify(req));
      }
  }


    return {
        getResponse: getResponse,
        getCategories: getCategories,
        genRequest: genRequest,
    };
});

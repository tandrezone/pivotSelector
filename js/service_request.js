app.factory('apiCall', function($http, $q) {
  var jsonClonned = [];
  function cleanArray(json) {
    debugger;
  $.extend(true, jsonClonned, json);

  for (var i = 0; i < jsonClonned.length; i++) {
  cleanArrayObject(jsonClonned[i], false);
  }

  console.log(json);

  console.log(jsonClonned);
  }

  function cleanArrayObject(obj, removeType) {
    delete obj.position;
    if (removeType) {
      delete obj.type;
    }
    delete obj.id;

    for (var i = 0; i < obj.elements.length; i++) {
      cleanArrayObject(obj.elements[i], true);
    }
  }

  return {
      cleanArray: cleanArray
  };
});

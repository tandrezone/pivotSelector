//esta directiva corre o template columns ao usar <div metrics></div>
app.directive('metrics', function () {
  return {
    templateUrl: 'templates/metrics.html'
  };
});
//Devido ao facto deste template ser recursivo ou seja o codigo é inserido dentro de codigo infinitas vezes foi necessario esta
//segunda directiva que trata do template a ser inseridodentro do template
//Este template usa dois servicoso SegmentBuilderC para lidar com o json que gera o template e o apiCall para os pedidos ao webservice
app.directive("segmentBuilderGroupM", function() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            data: '=',
            parentId: '=',
            level: '=',
            duplicatePlease: '&',
            deletePlease: '&'
        },
        templateUrl:  'segmentBuilderGroupTplM',
        controller: function($scope, $rootScope, SegmentBuilderM, apiCall, connector, $timeout) {
            $rootScope.$on('categoriesM', function (event, args) {
                sortResponse(args);
            });


            var sortResponse = function (response) {

                $scope.varTypes = response.variableTypes
                $scope.variables = response.variables;
                var vars = [];
                for (var j = 0; j < $scope.varTypes.length; j++) {
                    for (var i = 0; i < $scope.variables.length; i++) {
                        if (vars[j] == undefined) {
                            vars[j] = { "type": $scope.varTypes[j].code, "elements": [] };
                        }
                        if ($scope.variables[i].type == vars[j].type) {
                            vars[j].elements.push({ "name": $scope.variables[i].name, "type": $scope.variables[i].type, "code": $scope.variables[i].code, "remove": $scope.variables[i].remove });
                        }
                    }
                }
                $scope.varstypes = vars;
            }
            var getPositionNewElement = function() {
                var maxPositionValue = 0;
                angular.forEach($scope.data.elements, function(value, key) {
                    if(value.position > maxPositionValue) maxPositionValue = value.position;
                });
                return maxPositionValue + 1;
            }

            var getElement = function(id) {
                var elem = null;
                angular.forEach($scope.data.elements, function(value, key) {
                    if(value.id == id) elem = value;
                });
                return elem;
            }
            $scope.changeRelation = function (elem) {
                $timeout(function() {
                    apiCall.getRequest($scope.data).then(function (response) {
                        connector.setGrid(response);
                    });
                }, 1000);
            }
            $scope.open = function (id) {
                $(id).modal();
            }
            $scope.addElement = function (type, name, element, code) {
                var newElem,
                    newPosition = getPositionNewElement();

                $rootScope.isDraggingJustFinished = false;
                newElem = SegmentBuilderM.getNewCriterion(newPosition, name, type, code);
                element.type.remove=1
                $scope.data.elements.push(newElem);
                apiCall.getRequest($scope.data).then(function (response) {
                    connector.setGrid(response);
                });
            }

            // id could be a criterion, segment, or group
            $scope.duplicateElement = function(id) {
                var element = getElement(id);

                if(element) {
                    var duplicate_element = SegmentBuilderM.duplicateElement(element, getPositionNewElement());
                    $scope.data.elements.push(duplicate_element);
                }
            }

            // id could be a criterion, segment, or group
            $scope.deleteElement = function(id, th, element, thi) {
                var start = $scope.data.elements.length - 1;
                for(var i = start; i >= 0; i--) {
                    if($scope.data.elements[i].id === id) {
                        $scope.data.elements.splice(i, 1);
                    }
                }
                for(var a = 0; a < $scope.varstypes.length; a++){
                  for(var b = 0; b < $scope.varstypes[a].elements.length; b++){
                      if($scope.varstypes[a].elements[b].name == element.name){
                        $scope.varstypes[a].elements[b].remove = 0
                      }
                  }
                }
                apiCall.getRequest($scope.data).then(function (response) {
                    connector.setGrid(response);
                });
            }

            $scope.listRelation = SegmentBuilderM.groupInfo.relation;
        },
    };
});
//para alem da directiva relativa ao template recursivo foi necessaria tambem umarelativa aos elementos
app.directive("segmentBuilderElementM", function($compile) {
    return {
        restrict: "E",
        replace: true,
        scope: {
            data: '=',
            parentId: '=',
            level: '=',
            duplicatePlease: '&',
            deletePlease: '&'
        },
        template: '',
        link: function (scope, element, attrs) {
            var subElementsString = '<segment-builder-group-m drag\
                                                            data="data"\
                                                            parent-id="parentId"\
                                                            level="level"\
                                                            delete-please="deletePlease({id: data.id})"\
                                                            duplicate-please="duplicatePlease({id: data.id})"></segment-builder-group-m>';

            if (angular.isArray(scope.data.elements)) {
                $compile(subElementsString)(scope, function(cloned, scope) {
                    element.append(cloned);
                });
            }
        },
        controller: function($scope) {}
    };
});

//para alem da directiva relativa ao template recursivo foi necessaria tambem umarelativa aos elementos
app.directive('segmentBuilderCriterionM', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            data: '=',
            parentId: '=',
            duplicatePlease: '&',
            deletePlease: '&'
        },
        template:  '<div drag class="criterion form-inline">\
                        <span class="glyphicon glyphicon-move"></span>\
                        <span>{{ data.name }}</span>\
                        <div ng-click="deletePlease({id: data.id})" class="pull-right><span class="glyphicon glyphicon-remove pull-right" style="float:right" aria-hidden="true">&times;</span></div>\
                    </div>',
        controller: function($scope) {},
        link: function(scope, element, attrs) {}
    };
});

//para alem da directiva relativa ao template recursivo foi necessaria tambem umarelativa aos elementos
app.directive('segmentBuilderSegmentM', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            data: '=',
            parentId: '=',
            duplicatePlease: '&',
            deletePlease: '&'
        },
        template:  '<div drag class="segment form-inline">\
                        <span class="btn btn-warning btn-xs"><span class="glyphicon glyphicon-move"></span></span>\
                        <span>{{ data.id }}</span>\
                        <input type="text" class="form-control input-sm" name="name" ng-model="data.segment"/>\
                        <button ng-click="deletePlease({id: data.id})" class="btn btn-xs btn-danger align-right"><span class="glyphicon glyphicon-trash"></span></button>\
                        <button ng-click="duplicatePlease({id: data.id})" class="btn btn-xs btn-primary align-right"><span class="glyphicon glyphicon-tags"></span></button>\
                    </div>',
        controller: function($scope) {},
        link: function(scope, element, attrs) {}
    };
});

//mais uma paraa funcao de drag
app.directive("drag", function($rootScope, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs)  {
      attrs.$set('draggable', 'true');
      var dragStyle = 'drag-in-progress';

      /*var handle = element.find('.btn-warning')[0];
      var target = false;
      element.bind('mousedown', function(event) {
        target = event.target;
      });*/

      element.bind('dragstart', function(event) {
        //if(!handle.contains(target)) {

          $rootScope.isDragging = true;

         	$rootScope.draggedElement = {
         	  id: scope.data.id,
         	  parent_id: scope.parentId
         	};

          $timeout(function() {
            element.addClass(dragStyle);
          });

          event.originalEvent.dataTransfer.setData('text/plain', 'go');
          event.originalEvent.dataTransfer.effectAllowed = 'move';
        //}
        //else {
          //event.preventDefault();
        //}
        event.stopPropagation();
      });

      element.bind('dragend', function(event) {
        $timeout(function() {
          $rootScope.isDragging = false;
          $rootScope.isDraggingJustFinished = true;
          $rootScope.draggedElement = null;

          element.removeClass(dragStyle);
        });

        $timeout(function() {
          $rootScope.isDraggingJustFinished = false;
        }, 1000);

        event.stopPropagation();
      });
    }
  }
});
//outra para o drop dps elementos
app.directive("dropTargetM", function($rootScope, $timeout, SegmentBuilderM) {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    template: '<div ng-hide="checkIfHide()" class="drop-zone drop-zone-m">\
                  <span class="glyphicon glyphicon-arrow-right"></span>\
               </div>',
    link: function(scope, element, attrs) {
        element.addClass(attrs.myClass);


        scope.checkIfHide = function () {
            var check = (
                      $rootScope.draggedElement &&
                      (
                        (attrs.hideWhenIdBefore && $rootScope.draggedElement.id == attrs.hideWhenIdBefore) ||
                        (attrs.hideWhenIdAfter && $rootScope.draggedElement.id == attrs.hideWhenIdAfter)
                      )
                  );
            return check;
        }


        var dropStyle = 'drag-hover';

        element.bind('dragenter', function(event) {
            event.preventDefault();
            event.stopPropagation();

            // why? because http://stackoverflow.com/questions/14203734/dragend-dragenter-and-dragleave-firing-off-immediately-when-i-drag
            $timeout(function() { element.addClass(dropStyle); });
        });

        element.bind('dragleave', function(event) {
            event.stopPropagation();

            $timeout(function() { element.removeClass(dropStyle); });
        });

        element.bind('dragover', function(event) {
            event.preventDefault();
            event.stopPropagation();
        });

        element.bind('drop', function(event) {
            event.preventDefault();
            event.stopPropagation();

            $timeout(function() { element.removeClass(dropStyle); });

            SegmentBuilderM.moveElement(
                $rootScope.draggedElement.id,
                $rootScope.draggedElement.parent_id,
                scope.data.id,
                attrs.position
            );
        });
    }
  }
});

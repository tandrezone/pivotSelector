//esta directiva corre o template columns ao usar <div lines></div>
app.directive('lines', function () {
    return {
        templateUrl: 'templates/lines.html'
    };
});
//Devido ao facto deste template ser recursivo ou seja o codigo é inserido dentro de codigo infinitas vezes foi necessario esta
//segunda directiva que trata do template a ser inseridodentro do template
//Este template usa dois servicoso SegmentBuilderC para lidar com o json que gera o template e o apiCall para os pedidos ao webservice
app.directive("segmentBuilderGroupL", function () {
    return {
        restrict: "E",
        replace: true,
        transclude:true,
        scope: {
            data: '=',
            parentId: '=',
            level: '=',
            index: '=',
            duplicatePlease: '&',
            deletePlease: '&'
        },
        templateUrl: 'segmentBuilderGroupTplL',
        controller: function ($scope, $rootScope, SegmentBuilderL, apiCall, connector) {

            $rootScope.$on('categoriesL', function (event, args) {
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
            var getPositionNewElement = function () {
                var maxPositionValue = 0;
                angular.forEach($scope.data.elements, function (value, key) {
                    if (value.position > maxPositionValue) maxPositionValue = value.position;
                });
                return maxPositionValue + 1;
            }

            var getElement = function (id) {
                var elem = null;
                angular.forEach($scope.data.elements, function (value, key) {
                    if (value.id == id) elem = value;
                });
                return elem;
            }

            $scope.addElement = function (type, name, element, code) {
                var newElem
                var newPosition = getPositionNewElement();
                $rootScope.isDraggingJustFinished = false;
                newElem = SegmentBuilderL.getNewGroup(newPosition, name, type, code);
                $scope.data.elements.push(newElem);
                element.type.remove = 1
                apiCall.getRequest($scope.data).then(function (response) {
                    connector.setGrid(response);
                });
            }

            $scope.open = function (id) {
                $(id).modal();
            }

            $scope.deleteElement = function (id, th, element, thi) {
                var start = $scope.data.elements.length - 1;
                for (var i = start; i >= 0; i--) {
                    if ($scope.data.elements[i].id === id) {
                        $scope.data.elements.splice(i, 1);
                    }
                }
                for (var a = 0; a < $scope.varstypes.length; a++) {
                    for (var b = 0; b < $scope.varstypes[a].elements.length; b++) {
                        if ($scope.varstypes[a].elements[b].name == element.name) {
                            $scope.varstypes[a].elements[b].remove = 0
                        }
                    }
                }
                apiCall.getRequest($scope.data).then(function (response) {
                    connector.setGrid(response);
                });
            }

            $scope.listRelation = SegmentBuilderL.groupInfo.relation;
        },
    };
});

//para alem da directiva relativa ao template recursivo foi necessaria tambem umarelativa aos elementos
app.directive("segmentBuilderElementL", function ($compile) {
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
            var subElementsString = '<segment-builder-group-l drag\ data="data"\ parent-id="parentId"\ level="level"\ delete-please="deletePlease({id: data.id})"\ ></segment-builder-group-l>';

            if (angular.isArray(scope.data.elements)) {
                $compile(subElementsString)(scope, function (cloned, scope) {
                    element.append(cloned);
                });
            }
        },
        controller: function ($scope) { }
    };
});
//mais uma paraa funcao de drag
app.directive("drag", function ($rootScope, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            attrs.$set('draggable', 'true');
            var dragStyle = 'drag-in-progress';
            element.bind('dragstart', function (event) {
                $rootScope.isDragging = true;

                $rootScope.draggedElement = {
                    id: scope.data.id,
                    parent_id: scope.parentId
                };

                $timeout(function () {
                    element.addClass(dragStyle);
                });

                event.originalEvent.dataTransfer.setData('text/plain', 'go');
                event.originalEvent.dataTransfer.effectAllowed = 'move';

                event.stopPropagation();
            });

            element.bind('dragend', function (event) {
                $timeout(function () {
                    $rootScope.isDragging = false;
                    $rootScope.isDraggingJustFinished = true;
                    $rootScope.draggedElement = null;

                    element.removeClass(dragStyle);
                });

                $timeout(function () {
                    $rootScope.isDraggingJustFinished = false;
                }, 1000);

                event.stopPropagation();
            });
        }
    }
});
//outra para o drop dps elementos
app.directive("dropTargetL", function ($rootScope, $timeout, SegmentBuilderL) {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: '<div ng-hide="checkIfHide()" class="drop-zone drop-zone-l">\
                  <span class="glyphicon glyphicon-arrow-right"></span>\
               </div>',
        link: function (scope, element, attrs) {
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

            element.bind('dragenter', function (event) {
                event.preventDefault();
                event.stopPropagation();

                // why? because http://stackoverflow.com/questions/14203734/dragend-dragenter-and-dragleave-firing-off-immediately-when-i-drag
                $timeout(function () { element.addClass(dropStyle); });
            });

            element.bind('dragleave', function (event) {
                event.stopPropagation();

                $timeout(function () { element.removeClass(dropStyle); });
            });

            element.bind('dragover', function (event) {
                event.preventDefault();
                event.stopPropagation();
            });

            element.bind('drop', function (event) {
                event.preventDefault();
                event.stopPropagation();

                $timeout(function () { element.removeClass(dropStyle); });

                SegmentBuilderL.moveElement(
                    $rootScope.draggedElement.id,
                    $rootScope.draggedElement.parent_id,
                    scope.data.id,
                    attrs.position
                );
            });
        }
    }
});

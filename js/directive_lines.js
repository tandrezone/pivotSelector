app.directive('lines', function() {
  return {
    templateUrl: 'templates/lines.html'
  };
});
app.directive("segmentBuilderGroupL", function() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            data: '=',
            parentId: '=',
            level: '=',
            index: '=',
            duplicatePlease: '&',
            deletePlease: '&'
        },
        templateUrl:  'segmentBuilderGroupTplL',
        controller: function($scope, $rootScope, SegmentBuilderL, $http) {
          //$scope.parts =[0];
            $http({
              method: 'GET',
              url: 'json/pivotset.json'
              }).then(function successCallback(response) {
                sortResponse(response.data);
              }, function errorCallback(response) {
                //console.log("Devido a não haver a possibilidade de correr cross origin sem servidor os dados sao martelados em vez de virem do http://harrisreports.marktest.com.pt/api/pivotsettings como ocorre com servidor");
                response = {"dateRange":{"startDate":"2015-01-01T00:00:00","endDate":"2015-06-30T00:00:00"},"variables":[{"type":"SocioDemo","code":"precagesr","name":"Age","segments":[{"id":1,"name":"Moins de 15 ans"},{"id":2,"name":"15-24 ans"},{"id":3,"name":"25-34 ans"},{"id":4,"name":"35-49 ans"},{"id":5,"name":"50 et plus"},{"id":6,"name":"NR"}]},{"type":"SocioDemo","code":"psexerec","name":"Gender","segments":[{"id":1,"name":"Un homme"},{"id":2,"name":"Une femme"},{"id":3,"name":"NR"}]},{"type":"SocioDemo","code":"preccsp","name":"Occupation","segments":[{"id":1,"name":"CSP+"},{"id":2,"name":"CSP-"},{"id":3,"name":"Inactifs"},{"id":4,"name":"NR"}]},{"type":"SocioDemo","code":"pagglor","name":"City Size","segments":[{"id":1,"name":"agglo + de 100000"},{"id":2,"name":"agglo -de 100000"},{"id":3,"name":"NR"}]},{"type":"SocioDemo","code":"pconsotv","name":"Consommation TV","segments":[{"id":1,"name":"Petits téléspectateurs"},{"id":2,"name":"Moyens téléspectateurs"},{"id":3,"name":"Gros téléspectateurs"},{"id":4,"name":"NR"}]},{"type":"SocioDemo","code":"preception_tv","name":"Type de reception TV","segments":[{"id":1,"name":"Offre restreinte"},{"id":2,"name":"Offre élargie"},{"id":3,"name":"NR"}]},{"type":"Programs","code":"programname","name":"TV Programs Name","segments":null},{"type":"Programs","code":"date","name":"Date (Jour/mois/année)","segments":null},{"type":"Programs","code":"weekday","name":"Jour de la semaine (lundi / mardi …)","segments":null},{"type":"Programs","code":"day","name":"Jour","segments":null},{"type":"Programs","code":"year","name":"Année","segments":null},{"type":"Programs","code":"month","name":"Mois","segments":null},{"type":"Programs","code":"quarter","name":"Trimestre","segments":null},{"type":"Programs","code":"yearmonth","name":"Année Mois","segments":null},{"type":"Programs","code":"weeknumber","name":"Numéro de la semaine (S1 S2 …)","segments":null},{"type":"Indicators","code":"satisfaction","name":"Satisfaction","segments":null},{"type":"Indicators","code":"attention","name":"Attention","segments":null},{"type":"Others","code":"programcode","name":"Code du programme","segments":null}],"variableTypes":[{"code":"SocioDemo","name":"SOCI-DEMO"},{"code":"Programs","name":"DETAILS PROGRAMMES"},{"code":"Indicators","name":"INDICATEURS"},{"code":"Others","name":"AUTRE"}]};
                sortResponse(response);
              });

            var sortResponse = function(response) {
              $scope.varTypes = response.variableTypes
              $scope.variables = response.variables;
              var vars = [];
              for(var j = 0; j < $scope.varTypes.length;j++){
                for(var i = 0; i < $scope.variables.length;i++){
                    if(vars[j] == undefined){
                      vars[j] = {"type": $scope.varTypes[j].code, "elements":[]};
                    }
                    if($scope.variables[i].type == vars[j].type){
                      vars[j].elements.push({"name" :$scope.variables[i].name, "type" : $scope.variables[i].type});
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

            $scope.addElement = function(type, name, element) {
              var newElem
              var newPosition = getPositionNewElement();
              $rootScope.isDraggingJustFinished = false;
              newElem = SegmentBuilderL.getNewGroup(newPosition, name, type);
              $scope.data.elements.push(newElem);
              element.type.del=1
            }

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
                        $scope.varstypes[a].elements[b].del = 0
                      }
                  }
                }
            }

            $scope.listRelation = SegmentBuilderL.groupInfo.relation;
        },
    };
});


app.directive("segmentBuilderElementL", function($compile) {
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
                $compile(subElementsString)(scope, function(cloned, scope) {
                    element.append(cloned);
                });
            }
        },
        controller: function($scope) {}
    };
});

app.directive("drag", function($rootScope, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs)  {
      attrs.$set('draggable', 'true');
      var dragStyle = 'drag-in-progress';
      element.bind('dragstart', function(event) {
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

app.directive("dropTargetL", function($rootScope, $timeout, SegmentBuilderL) {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    template: '<div ng-hide="checkIfHide()" class="drop-zone drop-zone-l">\
                  <span class="glyphicon glyphicon-arrow-right"></span>\
               </div>',
    link: function(scope, element, attrs) {
        element.addClass(attrs.myClass);

        scope.checkIfHide = function() {

            var checker = (
                      $rootScope.draggedElement &&
                      (
                        (attrs.hideWhenIdBefore && $rootScope.draggedElement.id == attrs.hideWhenIdBefore) ||
                        (attrs.hideWhenIdAfter && $rootScope.draggedElement.id == attrs.hideWhenIdAfter)
                      )
                  );
            return checker;
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

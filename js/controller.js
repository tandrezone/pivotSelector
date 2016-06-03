
app.controller('start', function($scope, $rootScope) {
});
app.controller('MainControllerC', function($scope, $rootScope, SegmentBuilderC) {
    $scope.dataMainGroup = SegmentBuilderC.currentSegment;
});
app.controller('MainControllerL', function($scope, $rootScope, SegmentBuilderL) {
    $scope.dataMainGroup = SegmentBuilderL.currentSegment;
});
app.controller('MainControllerM', function($scope, $rootScope, SegmentBuilderM) {
    $scope.dataMainGroup = SegmentBuilderM.currentSegment;
});

app.controller('HarrisController', function($scope, $http) {
  $http.get('json/response.json').success(function (response) {
      $scope.Data = response;
  });
});


app.controller('start', function($scope, $rootScope) {
  $scope.templates =
      [ { name: 'columns.html', url: 'columns.html'}
       ];
    $scope.template = $scope.templates[0];

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

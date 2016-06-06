//controlador geral
app.controller('start', function($scope, $rootScope) {
});
//controlador colunas
app.controller('MainControllerC', function($scope, $rootScope, SegmentBuilderC) {
    $scope.dataMainGroup = SegmentBuilderC.currentSegment;
});
//controlador linhas
app.controller('MainControllerL', function($scope, $rootScope, SegmentBuilderL) {
    $scope.dataMainGroup = SegmentBuilderL.currentSegment;
});
//controlador metricas
app.controller('MainControllerM', function($scope, $rootScope, SegmentBuilderM) {
    $scope.dataMainGroup = SegmentBuilderM.currentSegment;
});
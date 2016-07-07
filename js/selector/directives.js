
app.directive('selector', function () {
    return {
        templateUrl: 'templates/select.html',
        controller: function ($scope, $rootScope, apiCall, connector, $compile, $timeout) {
            apiCall.getDefaults().then(function (response) {
                $scope.Data = response;
            });
            $scope.Cstate = function (index) {
                $scope.idx = index;

                var pivotSettingDefault = $scope.Data[index];

                var jsonDef = JSON.parse(pivotSettingDefault.Json);

                if (!$.isEmptyObject(jsonDef)) {
                    connector.setColumns(jsonDef[0].elements);
                    connector.setLines(jsonDef[1].elements);
                    connector.setMetrics(jsonDef[2].elements);
                } else {
                    connector.setColumns();
                    connector.setLines();
                    connector.setMetrics();
                }

                connector.setIdx(pivotSettingDefault.Id);

                $("#pivot").html("<div pivotset></div>");

                $compile($("#pivot").contents()) ($scope);

                apiCall.save(jsonDef, pivotSettingDefault.Id);
            }
        }
    };
});

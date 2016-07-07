/*
* directive(grid)
* Vai buscar os dados vindos do do request para preencher a grid
* @param ()
* @return (promise) (promise é um callback)
*/
app.directive('grid', function () {
    return {
        templateUrl: 'templates/grid.html',
        require: ['ngChange', 'ngModel'],
        transclude: true,
        controller: function ($scope, $rootScope, apiCall, connector) {

        }
    };
});

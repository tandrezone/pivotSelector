//Esta directiva é relativa à grid criada pelo miguel, para usar esta grid basta usar a tag <div grid></div> em qualquer controlador basta apenas que a app seja definida coma variavel  app como no nosso
//caso var app = angular.module('app', []);
// o objectivo desta directiva é o facto de poder ser usada em qualquer lado e construir-se baseado na resposta que vem do servidor, funcionando sozinha e sem afectar o controlador

//Dependencias:
// Esta directiva podia não depender de nada, mas devido à nossa extrutura depende de um serviço chamado apiCall (Este serviço é responsavel por todos os pedidos ao web service)
//E visto que esta directiva depende de dados vindos do webservice usamos a apiCall

//Template
//O template (html) desta grid esta em Pages/templates/grid.html

//Funcionalidades futuras, como a grid so por si é um objecto html pode ser inserido em qualquer sitio, independentemente de ser pivot ou nao bastando defenir no controlador 
//o request a passar para a apiCall de modo aquea resposta seja a correcta para ser consumida pela grid
app.directive('grid', function () {
    return {
        templateUrl: 'templates/grid.html',
        controller: function ($scope, $rootScope, apiCall) {
            apiCall.getResponse().then(function (response) {
                $scope.Data = response;
            });
        }
    };
});
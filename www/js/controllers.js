angular.module('starter.controllers', [])


.controller('CalcularCtrl', function($scope) {

  var calculo = new calcDri();

  $scope.valorTotal = 0;
  $scope.cmte = null;
  $scope.general = null;
  $scope.superior = null;
  $scope.oficial = null;
  $scope.sosgt = null;
  $scope.alunos = null;
  $scope.cbsd = null;
  $scope.totalDias = null;
  $scope.localidade = 'l1';
  $scope.ultimaInteira = false;
  $scope.adicional = false;
  $scope.exibirResultado = false;
  $scope.exibirMensagem = false;

  $scope.calcularDiarias = function(cmte,general,superior,oficial,sosgt,
                    alunos,cbsd,dias,localidade,ultimaInteira,adicional){

    var totalMilitares = cmte + general + superior + oficial +
                          sosgt + alunos + cbsd;

    if (totalMilitares < 1) {

      $scope.msg = 'Informe a quantidade de militares!';
      $scope.exibirMensagem = true;

    } else if (dias < 1) {

      $scope.msg = 'Informe o total de dias!';
      $scope.exibirMensagem = true;

    } else {

      $scope.valorTotal = calculo.execute(cmte,general,superior,oficial,sosgt,
              alunos,cbsd,dias,localidade,ultimaInteira,adicional);

      $scope.exibirResultado = true;
      $scope.exibirMensagem = false;

    };

  };

})

.controller('ValoresCtrl', function($scope) {

  var diarias = new getDri();

  diarias.load();

  $scope.tabela = diarias.itens;
  $scope.testeAdicional = diarias.adicionalED;

  $scope.salvarTabela = function(){
    diarias.save();
  };

  $scope.tabelaPadrao = function () {
    diarias.reset();
    $scope.tabela = diarias.itens;
    $scope.testeAdicional = diarias.adicionalED;
  };

})

.controller('LocalidadesCtrl', function($scope) {


})

.controller('CirculosCtrl', function($scope) {


});

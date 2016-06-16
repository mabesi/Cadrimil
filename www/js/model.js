function nz(val) {
   if (isNaN(val)) {
     return 0;
   }
   return val;
};

function getDri(){

  this.getTabelaPadrao = function(){

    var tabela = [
      {'classe':'A','valor': {'l1':406.70,'l2':386.37,'l3':364.00,'l4':321.29}},
      {'classe':'B','valor': {'l1':321.10,'l2':304.20,'l3':287.30,'l4':253.50}},
      {'classe':'C','valor': {'l1':267.90,'l2':253.80,'l3':239.70,'l4':211.50}},
      {'classe':'D','valor': {'l1':224.20,'l2':212.40,'l3':200.60,'l4':177.00}},
      {'classe':'E','valor': {'l1':224.20,'l2':212.40,'l3':200.60,'l4':177.00}},
      {'classe':'F','valor': {'l1':186.20,'l2':176.40,'l3':166.60,'l4':147.00}},
      {'classe':'G','valor': {'l1':186.20,'l2':176.40,'l3':166.60,'l4':147.00}}
    ];

    return tabela;

  };

  this.getAdicionalPadrao = function(){

    var adicional = {'valor':95.00};

    return adicional;

  };

  this.save = function(){

      var tabelaDiarias = angular.toJson(this.itens);
      var valorAdicional = angular.toJson(this.adicionalED);

      localStorage.setItem("tabelaDiarias",tabelaDiarias);
      localStorage.setItem("valorAdicional",valorAdicional);
  };

  this.load = function(){

    var tabelaDiarias = localStorage.getItem('tabelaDiarias');
    var valorAdicional = localStorage.getItem('valorAdicional');

    if (tabelaDiarias !== null && tabelaDiarias !== undefined) {
      this.itens = angular.fromJson(tabelaDiarias);
    } else {
      this.itens = this.getTabelaPadrao();
    };

    if (valorAdicional !== null && valorAdicional !== undefined) {
      this.adicionalED = angular.fromJson(valorAdicional);
    } else {
      this.adicionalED = this.getAdicionalPadrao();
    };

    this.save();

  };

  this.reset = function (arguments) {
    localStorage.removeItem('tabelaDiarias');
    localStorage.removeItem('valorAdicional');
    this.load();
  };

};


function calcDri(){


  this.diarias = new getDri();
  this.diarias.load();

  // Função execute()
  this.execute = function(cmte,general,superior,oficial,sosgt,
          alunos,cbsd,dias,localidade,ultimaInteira,adicional){

    var totalDiario = 0,
        totalMilitares = 0,
        totalAdicional = 0,
        ultimo = 0.5,
        valorTotal = 0;

    totalDiario += nz(cmte) * this.valorDiaria(0,localidade);
    totalDiario += nz(general) * this.valorDiaria(1,localidade);
    totalDiario += nz(superior) * this.valorDiaria(2,localidade);
    totalDiario += nz(oficial) * this.valorDiaria(3,localidade);
    totalDiario += nz(sosgt) * this.valorDiaria(4,localidade);
    totalDiario += nz(alunos) * this.valorDiaria(5,localidade);
    totalDiario += nz(cbsd) * this.valorDiaria(6,localidade);

    totalMilitares = nz(cmte) + nz(general) + nz(superior) +
                  nz(oficial) + nz(sosgt) + nz(alunos) + nz(cbsd);

    if (adicional) {
      totalAdicional = this.diarias.adicionalED.valor * totalMilitares;
    };

    if (ultimaInteira) {
      ultimo = 0;
    };

    valorTotal = nz(totalAdicional) + ((nz(dias) - ultimo) * totalDiario);

    return valorTotal;

  };

  // Função valorDiaria()
  this.valorDiaria = function(nivel,local){

    return parseFloat(this.diarias.itens[nivel].valor[local]);

  };

};

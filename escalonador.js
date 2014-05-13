(function(window, document) {

  "use strict";

  var Escalonador, Estado, Processo, Simulador, btiniciar;

  Estado = {
    NOVO: 0,
    PRONTO: 1,
    EM_ESPERA: 2,
    EM_EXECUCAO: 3,
    ENCERRADO: 4
  };

  Simulador = {

    quantidadeProcessos: 0,

    tabela: document.querySelector("#tabela-processos"),

    debug: false,

    iniciar: function() {
      var quantum = document.querySelector("#quantum").value.trim();
      var quantidadePorMinuto = document.querySelector("#quantidadePorMinuto").value.trim();
      var tempoDeVida = document.querySelector("#tempoDeVida").value.trim();
      var chanceDeEspera = document.querySelector("#chanceDeEspera").value.trim();
      var mostraEncerramento = document.querySelector("#mostraEncerrado").checked;
      var valido = true;

      valido = this.validaInput(1, quantum, quantidadePorMinuto, tempoDeVida) &&
        this.validaInput(0, chanceDeEspera);

      if(valido) {
        this.tabela.innerHTML = "";
        Escalonador.iniciar({
          quantum: quantum,
          quantidadePorMinuto: quantidadePorMinuto,
          chanceDeEspera: chanceDeEspera,
          tempoDeVida: tempoDeVida,
          mostraEncerramento: mostraEncerramento
        });
      }
    },

    validaInput: function() {
      var valorMinimo = arguments[0];

      //Validando somente números
      var regex = /[0-9]*/g;

      for(var i = 1, l = arguments.length; i < l; i++) {
        if(arguments[i] === "" || arguments[i].match(regex)[0] !== arguments[i]) {
          if(valorMinimo && window.parseInt(arguments[i], 10) >= valorMinimo) {
            window.alert("Valor não pode ser zero");
            return false;
          }
          window.alert("Valor dos parâmetros deve ser preenchido e deve ser numérico");
          return false;
        }
      }
      return true;
    },

    adicionaProcesso: function(pid, codEstado) {
      var linha, estado;

      if(this.quantidadeProcessos <= 0) {
        linha = "<tr><td>PID</td><td>ESTADO</td></tr>";
        this.tabela.innerHTML = linha;
      }

      estado = this.getObjetoEstado(codEstado);
      linha = "<tr id='p"+ pid +"'>";
      linha += "<td>" + pid + "</td>";
      linha += "<td class='"+ estado.cor +"'>";
      linha += estado.nome +"</td>";
      linha += "</tr>";
      this.tabela.innerHTML += linha;
      this.quantidadeProcessos++;

    },

    alteraProcesso: function(pid, codEstado) {
      try {
        var processo = document.querySelector("#p" + pid);
        var estado = this.getObjetoEstado(codEstado);
        var elementoTexto = processo.querySelector("td:last-child");
        elementoTexto.className = estado.cor;
        elementoTexto.innerText = estado.nome;
      }
      catch(e) {
        if(this.debug)
          window.console.error("Processo já removido: " + e.message);
      }
    },

    removeProcesso: function(pid) {
      try {
        var processo = document.querySelector("#p" + pid);
        processo.parentNode.removeChild(processo);
        this.quantidadeProcessos--;
      }
      catch(e) {
        this.quantidadeProcessos--;
        if(this.debug)
          window.console.error("Processo já removido: " + e.message);
      }
      finally {
        var linha;
        if(this.quantidadeProcessos <= 0) {
          this.quantidadeProcessos = 0;
          linha = "<tr><td>Nenhum processo</td></tr>";
          this.tabela.innerHTML = linha;
        }
      }
    },

    getObjetoEstado: function(estado) {
      switch(estado) {
        case Estado.NOVO:
          return {
            nome: "Novo",
            cor: "preto"
          };
        case Estado.PRONTO:
          return {
            nome: "Pronto",
            cor: "azul"
          };
        case Estado.EM_EXECUCAO:
          return {
            nome: "Executando",
            cor: "verde"
          };
        case Estado.EM_ESPERA:
          return {
            nome: "Esperando",
            cor: "amarelo"
          };
        case Estado.ENCERRADO:
          return {
            nome: "Encerrado",
            cor: "vermelho"
          };
      }
    }
  };

  Processo = (function() {

    Processo.prototype.pid = null;

    Processo.prototype.estado = null;

    Processo.prototype.tempoDeVida = null;

    Processo.prototype.chanceDeEspera = null;

    function Processo(pid, tempoDeVida, mostraEncerramento, chanceDeEspera) {
      this.pid = pid;
      this.estado = Estado.NOVO;
      this.tempoDeVida = tempoDeVida;
      this.chanceDeEspera = chanceDeEspera;
      Simulador.adicionaProcesso(pid, this.estado);

      window.setTimeout(this.encerrar.bind(this, mostraEncerramento), this.tempoDeVida);

      //Processo pronto
      this.pronto();
    }

    Processo.prototype.getEstado = function() {
      return this.estado;
    };

    Processo.prototype.pronto = function() {
      if(this.estado !== Estado.ENCERRADO) {
        this.estado = Estado.PRONTO;
        Simulador.alteraProcesso(this.pid, this.estado);
      }
    };

    Processo.prototype.entraEmEspera = function() {
      var porcentagemDeChance = this.chanceDeEspera;
      var random = ((Math.random()*100)+1);
      if(random <= porcentagemDeChance) {
        window.setTimeout(this.pronto.bind(this), 1000);
        Escalonador.contadorEspera++;
        return true;
      }
      Escalonador.contadorExecutou++;
      return false;
    };

    Processo.prototype.esperar = function() {
      if(this.estado === Estado.EM_EXECUCAO) {
        this.estado = Estado.EM_ESPERA;
        Simulador.alteraProcesso(this.pid, this.estado);
      }
    };

    Processo.prototype.executar = function() {
      if(this.estado === Estado.PRONTO) {
        if(!this.entraEmEspera) {
          this.estado = Estado.EM_EXECUCAO;
          Simulador.alteraProcesso(this.pid, this.estado);
        }
        else {
          this.esperar();
        }
      }
    };

    Processo.prototype.encerrar = function(mostraEncerramento) {
      if(this.estado !== Estado.ENCERRADO) {
        this.estado = Estado.ENCERRADO;
        Simulador.alteraProcesso(this.pid, this.estado);
        if(!mostraEncerramento)
          window.setTimeout(this.destruir.bind(this), 3000);
        Escalonador.finalizarProcesso(this.pid);
      }
    };

    Processo.prototype.destruir = function() {
      Simulador.removeProcesso(this.pid);
    };

    return Processo;
  })();

  Escalonador = {

    // Parâmetros do Escalonador.
    // O tempo é expresso em milisegundos

    //Quantidade de tempo que o escalonador leva para trocar o processo
    quantum: null,

    // Tempo para verificar se o quantum foi atingido
    tempoDecorrido: 0,

    //Tempo de vida default do processo: 30 segundos
    tempoDeVida: 30000,

    //Quantidade máxima de processos que são instanciados no minuto
    quantidadePorMinuto: null,

    //Chance do processo entrar em espera
    chanceDeEspera: null,

    //Flag que determina se processos encerrados saem da visualização
    mostraEncerramento: false,

    //Clock do minuto do escalonador
    timerMinuto: null,

    //Clock do segundo do escalonador
    timerSegundo: null,

    //Timer do quantum, troca de processos
    timerExecucao: null,

    proxPid: null,

    processoEmExecucao: null,

    processosNoMinuto: 0,

    processos: {},

    ultimoIndice: 0,

    //Debug espera
    contadorEspera: 0,

    contadorExecutou: 0,

    debug: false,

    verbose: function() {
      this.debug = !this.debug;
      return this.debug;
    },

    //Gera código randômico hexadecimal de 4 dígitos
    R4: function() {
      return ((1 + Math.random())*100000 | 0).toString(16).substring(1);
    },

    //Junta os códigos randômicos para gerar um id único
    geraPID: function() {
      var pid = "" + this.R4() + this.R4();
      pid += "-";
      pid += this.R4() + this.R4();
      pid += "-";
      pid += this.R4();
      return pid;
    },

    iniciar: function(opcoes) {
      this.quantum = opcoes.quantum;
      this.quantidadePorMinuto = opcoes.quantidadePorMinuto;
      this.tempoDeVida = opcoes.tempoDeVida;
      this.chanceDeEspera = opcoes.chanceDeEspera;
      this.mostraEncerramento = opcoes.mostraEncerramento;

      //Zerando escalonador
      this.processos = {};
      this.proxPid = null;
      this.processoEmExecucao = null;
      this.tempoDecorrido = 0;
      this.contadorExecutou = 0;
      this.contadorEspera = 0;

      if(this.timerMinuto)
        window.clearInterval(this.timerMinuto);

      if(this.timerSegundo)
        window.clearTimeout(this.timerSegundo);

      if(this.timerExecucao)
        window.clearInterval(this.timerExecucao);

      this.processosNoMinuto = 0;
      this.geraLoteDeProcessos();

      //Loop contínuo a cada 60 segundos + 1 que move o Escalonador
      this.timerMinuto = window.setInterval(function(){
        this.processosNoMinuto = 0;
        this.geraLoteDeProcessos();
      }.bind(this), 61000);

      this.timerExecucao = window.setInterval(this.trocaProcesso.bind(this), this.quantum);
    },

    geraLoteDeProcessos: function() {
      var qtde = Math.ceil(this.quantidadePorMinuto/60);
      if(this.processosNoMinuto >= this.quantidadePorMinuto) {
        if(this.debug) {
          window.console.log("O lote de processos do minuto foi criado");
          window.console.log("NUMERO DE ESPERA: " + this.contadorEspera);
          window.console.log("NUMERO EXECUTADO: " + this.contadorExecutou);
          this.contadorEspera = 0;
          this.contadorExecutou = 0;
        }
      }
      else {
        for(var i = 0; i < qtde; i++) {
          this.criaNovoProcesso();
          this.processosNoMinuto++;
        }
        this.timerSegundo = window.setTimeout(this.geraLoteDeProcessos.bind(this), 1000);
      }
    },

    trocaProcesso: function() {
      var pids, processo, proxPid;

      pids = Object.keys(this.processos);

      if(this.proxPid === null) {
        if(pids[0] !== undefined) {
          this.proxPid = pids[0];
          this.ultimoIndice = 0;
        }
        else {
          return;
        }
      }
      else {
        proxPid = pids[this.ultimoIndice];
        if(proxPid !== undefined) {
          this.proxPid = proxPid;
        }
        else {
          if(pids[0] !== undefined) {
            this.proxPid = pids[0];
            this.ultimoIndice = 0;
          }
          else {
            this.proxPid  = null;
          }
        }
      }

      //Parando execução do processo atual se existente e fora da espera
      if(this.processoEmExecucao !== null) {
        //Pula processos em espera
        if(this.processoEmExecucao.getEstado() !== Estado.EM_ESPERA)
          this.processoEmExecucao.pronto();
      }

      processo = this.getProcesso(this.proxPid);

      //Executa o próximo processo se ele existir
      if (processo) {
        //Pula processos em espera
        if(processo.getEstado() === Estado.EM_ESPERA) {
          this.ultimoIndice++;
          return;
        }

        if(processo.getEstado() === Estado.PRONTO) {
          processo.executar();
        }

        this.processoEmExecucao = processo;

        this.ultimoIndice++;
      }
      else {
        this.processoEmExecucao = null;
        this.proxPid = null;
      }

    },

    criaNovoProcesso: function() {
      var pid = this.geraPID();
      var novoProcesso = new Processo(pid, this.tempoDeVida, this.mostraEncerramento, this.chanceDeEspera);
      this.processos[pid] = novoProcesso;
      if(this.debug) {
        window.console.log("Novo processo adicionado");
        window.console.log(this.processosNoMinuto);
      }
    },

    getProcesso: function(pid) {
      if(this.processos[pid] !== undefined)
        return this.processos[pid];
      else
        return null;
    },

    finalizarProcesso: function(pid) {
      delete this.processos[pid];
      if(this.ultimoIndice > 0) {
        this.ultimoIndice--;
      }
    },
  };

  window.Escalonador = Escalonador;

  //Inicia tudo quando apertado o Iniciar Simulação
  btiniciar = document.querySelector("#btiniciar");
  btiniciar.addEventListener("click", function(e){
    e.preventDefault();
    Simulador.iniciar();
    return false;
  }.bind(this), false);
})(window, document);

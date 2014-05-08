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

    iniciar: function() {
      var quantum = document.querySelector("#quantum").value.trim();
      var quantidadePorMinuto = document.querySelector("#quantidadePorMinuto").value.trim();
      var tempoDeVida = document.querySelector("#tempoDeVida").value.trim();
      var chanceDeEspera = document.querySelector("#chanceDeEspera").value.trim();
      var valido = true;

      valido = this.validaInput(1, quantum, quantidadePorMinuto, tempoDeVida) &&
        this.validaInput(0, chanceDeEspera);

      if(valido) {
        this.tabela.innerHTML = "";
        Escalonador.iniciar({
          quantum: quantum,
          quantidadePorMinuto: quantidadePorMinuto,
          chanceDeEspera: chanceDeEspera,
          tempoDeVida: tempoDeVida
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
      var processo, estado, elementoTexto;
      processo = document.querySelector("#p" + pid);
      estado = this.getObjetoEstado(codEstado);
      elementoTexto = processo.querySelector("td:last-child");
      elementoTexto.className = estado.cor;
      elementoTexto.innerText = estado.nome;
    },

    removeProcesso: function(pid) {
      var processo, linha;

      processo = document.querySelector("#p" + pid);

      processo.parentNode.removeChild(processo);

      this.quantidadeProcessos--;

      if(this.quantidadeProcessos <= 0) {
        linha = "<tr><td>Nenhum processo</td></tr>";
        this.tabela.innerHTML = linha;
      }
    },

    getObjetoEstado: function(estado) {
      switch(estado) {
        case Estado.NOVO:
          return {
            nome: "NOVO",
            cor: "preto"
          };
        case Estado.PRONTO:
          return {
            nome: "PRONTO",
            cor: "azul"
          };
        case Estado.EM_EXECUCAO:
          return {
            nome: "EM EXECUÇÃO",
            cor: "verde"
          };
        case Estado.EM_ESPERA:
          return {
            nome: "EM ESPERA",
            cor: "amarelo"
          };
        case Estado.ENCERRADO:
          return {
            nome: "ENCERRADO",
            cor: "vermelho"
          };
      }
    }
  };

  Processo = (function() {

    Processo.prototype.debug = false;

    Processo.prototype.pid = null;

    Processo.prototype.estado = null;

    Processo.prototype.tempoDeVida = null;

    function Processo(pid, tempoDeVida, debug) {
      this.pid = pid;
      this.estado = Estado.NOVO;
      this.tempoDeVida = tempoDeVida;
      if(debug) {
        this.debug = true;
        window.console.log("Processo criado: " + pid);
      }
      Simulador.adicionaProcesso(pid, this.estado);

      //Processo pronto
      this.pronto();
    }

    Processo.prototype.getEstado = function() {
      return this.estado;
    };

    Processo.prototype.pronto = function() {
      this.estado = Estado.PRONTO;
      Simulador.alteraProcesso(this.pid, this.estado);
    };

    Processo.prototype.esperar = function() {
      this.estado = Estado.EM_ESPERA;
      Simulador.alteraProcesso(this.pid, this.estado);
    };

    Processo.prototype.executar = function() {
      this.estado = Estado.EM_EXECUCAO;
      Simulador.alteraProcesso(this.pid, this.estado);
    };

    Processo.prototype.encerrar = function() {
      this.estado = Estado.ENCERRADO;
      Simulador.alteraProcesso(this.pid, this.estado);
      window.setTimeout(this.destruir.bind(this), 3000);
      Escalonador.finalizarProcesso(this.pid);
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

      this.processos = {};
      this.proxPid = null;
      this.processoEmExecucao = null;
      this.tempoDecorrido = 0;

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

      this.timerExecucao = window.setInterval(this.verificaQuantum.bind(this), 1000);

    },

    geraLoteDeProcessos: function() {

      var qtde = Math.ceil(this.quantidadePorMinuto/60);

      if(this.processosNoMinuto >= this.quantidadePorMinuto) {
        if(this.debug)
          window.console.log("O lote de processos do minuto foi criado");
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

      var pids, processo, mudou;

      //TODO: Rever este método.
      pids = Object.keys(this.processos);

      if(this.proxPid === null) {
        if(pids[0] !== undefined) {
          this.proxPid = pids[0];
        }
        else {
          return;
        }
      }
      else {
        mudou = 0;
        for(var i = 0, l = pids.length; i < l; i++) {
          if(pids[i] === this.proxPid) {
            if(pids[i+1] !== undefined) {
              this.proxPid = pids[i+1];
              mudou = 1;
              break;
            }
            else {
              this.proxPid = pids[0];
              mudou = 1;
              break;
            }
          }
        }
        if(mudou === 0) {
          this.proxPid = null;
        }
      }

      //Parando execução do processo atual se existente e fora da espera
      if(this.processoEmExecucao !== null) {
        //Pula processos em espera
        if(this.processoEmExecucao.getEstado() == Estado.EM_ESPERA) {
          this.indexEmExecucao++;
          return this.trocaProcesso();
        }
        else {
          this.processoEmExecucao.pronto();
        }
      }

      processo = this.getProcesso(this.proxPid);

      //Executa o próximo processo se ele existir
      if (processo) {
        if(processo.getEstado() == Estado.PRONTO) {
          processo.executar();
        }

        this.processoEmExecucao = processo;
      }
      else {
        this.processoEmExecucao = null;
      }

    },

    verificaQuantum: function() {
      var processoTemp;

      if (this.quantum !== null) {
        this.tempoDecorrido += 1000;
        if (this.processoEmExecucao) {
          this.processoEmExecucao.tempoDeVida -= 1000;

          if (this.processoEmExecucao.tempoDeVida <= 0) {
            processoTemp = this.processoEmExecucao;
            this.trocaProcesso();
            processoTemp.encerrar();
            if (this.tempoDecorrido >= this.quantum) {
              this.tempoDecorrido = 0;
            }
            return;
          }
        }

        if (this.tempoDecorrido >= this.quantum) {
          this.trocaProcesso();
          this.tempoDecorrido = 0;
        }
      }
    },

    criaNovoProcesso: function() {
      var pid = this.geraPID();
      var novoProcesso = new Processo(pid, this.tempoDeVida, this.debug);
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

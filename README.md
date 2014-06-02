SimuladorEscalonadorJS
======================

## O que é isto?

O SimuladorEscalonadorJS é um projeto que visa implementar um escalonador de processos utilizando o algoritmo Round-Robin em JavaScript puro. Sem plugins, libs ou frameworks de terceiros.

## Como funciona?

A implementação deste simulador possui 3 pseudo-classes atuando em conjunto:

 - Simulador
 - Escalonador
 - Processo

A tarefa do Simulador é controlar a interface, ele que faz a ponte entre o Escalonador e o usuário do aplicativo.

O Escalonador é o ator que controla os processos, executa eles conforme o quantum e controla espera e finalização de processos.

O Processo é o agente controlado pelo Escalonador, o processo possui propriedades próprias que estão sob são geridas conforme os parâmetros de criação do mesmo (setados pelo Escalonador). Além disso ele possui cinco possíveis estados:

  - Novo
  - Pronto
  - Executando
  - Esperando
  - Encerrado

Para fazer tudo funcionar o escalonador conta com três timers internos:

  - O timer do minuto, que controla os lotes de criação de processos e monitora throughput.
  - O timer do segundo, que controla a criação individual de processos em um segundo específico.
  - O timer do quantum, setado pelo usuário, esse timer controla a troca de execução entre processos assim como influencia no tempo de vida.

## Usando o escalonador

Para usar o escalonador é bem simples, [acesse este link](https://mkautzmann.github.io/SimuladorEscalonadorJS).

Logo que você acessar o Escalonador você irá encontrar os controles da simulação. Cada um deles influi em de uma forma diferente na simulação.

### Quantum

O Quantum, expresso em milissegundos, controla a velocidade da sua simulação. Quanto menor o quantum mais rápida é a troca entre processos.

### Quantidade/minuto

Como o label já indica esse parâmetro especifica a quantidade máxima de processos que o Escalonador irá criar em um minuto.

O Escalonador procura distribuir essa criação de uma forma homogênea ao longo do período.

Por exemplo, se for estabelecida uma quantidade de 60 processos por minuto o Escalonador irá criar 1 processo por segundo.

### Tempo de vida

O tempo de vida do processo. É medido em ciclos, um ciclo é uma volta completa na lista de processos. Quando menor for o seu quantum menor vai ser o tempo do ciclo.

Existe a possibilidade de um processo nunca "morrer", isso acontece quando o quantum não é rápido o suficiente para dar a quantidade de voltas necessárias para encerrar o processo. Isso é possível pois o escalonador nunca encerra a criação de processos.

### Chance de processo I/O Bound

Neste simulador os processos I/O Bound são na verdade processos que assim que executados entram em espera por algum tempo antes de continuar executando.

Esses processos especiais são criados randômicamente, você pode controlar a frequência com a qual esses processos aparecem usando esse parâmetro.

### Tempo de espera

Esse parâmetro está relacionado com os processos I/O Bound, ele identifica quanto tempo o processo vai ficar na espera de ser executado novamente. Como não há processo de I/O verídico acontecendo estamos simulando dessa forma.

Esse tempo também é contado em ciclos.

### Exibir todos os processos encerrados

Ao longo do desenvolvimento percebemos que ao deixar o simulador executando por um tempo gerava uma lista grande de processos encerrados, então por padrão passados 3 segundos do encerramento de um processo ele some automaticamente da lista de processos.

Para desabilitar isso basta marcar a caixa.

### Ativar debug

Esse modo é pra quem quer visualizar o que ocorre por baixo do capô do simulador, ao abrir o console do navegador você pode obter logs de execução com esse modo ativo.

### Iniciar simulação

O botão inicia a simulação, você pode iniciar quantas simulações quiser sem recarregar a página. O simulador se encarrega de começar a simulação com os novos parâmetros.

## Estatísticas

O simulador possuí um conjunto de estatísticas sobre o que está acontecendo com os processos. Atualmente existem um conjunto de 7 estatísticas:

  - Throughput: número de processos que o escalonador consegue finalizar no minuto;
  - Taxa de criação de processos: mostra quantos processos o escalonador está criando por segundo;
  - Número de processos já criados: mostra a quantidade total de processos já criados pelo escalonador;
  - Número de processos em espera: mostra a quantidade de processos com o estado em espera no momento;
  - Número de processos encerrados: mostra a quantidade total de processos já encerrados pelo escalonador;
  - Número de processos ativos: mostra a quantidade de processos pendentes (não encerrados) no escalonador;
  - Número de processos I/O Bound já criados: mostra a quantidade total de processos do tipo I/O Bound já criados pelo escalonador.

Lembre-se que as estatísticas exibem os dados considerando todos os processos que já passaram pelo escalonador, até mesmo os ocultos da interface caso não esteja marcada a opção Exibir todos os processos encerrados.

## Tabela de processos

A tabela de processos mostra em tempo real o funcionamento do escalonador, três colunas estão disponíveis para análise:

  - PID: significa Process Identifier. É comum em sistemas operacionais. O nosso PID é gerado randômicamente. O PID é formado por uma concatenação hexadecimal de conjuntos randômicos de 4 algarismos para juntos formarem um pseudo indentificador único em uma string de 22 caracteres;
  - Turnaround: É o tempo que levou para o processo encerrar, contando desde a sua criação em milissegundos.
  - Estado: O estado atual do processo, pode assumir um dos cinco estados possíveis informados anteriormente.

## Objetivo

O projeto foi desenvolvido para fins de estudo sobre escalonamento de processos para a disciplina de Sistemas Operacionais I na [Universidade Feevale](http://feevale.br).

O código fonte está disponível para todos que quiserem dar uma olhada, o projeto é open source e é incentivado o envio de críticas e melhorias.

## Licença

O projeto está sob a licença [MIT](LICENSE), ou seja, você pode fazer um fork e modificar da forma que quiser e usar da forma que quiser.

## Autores

Grupo 4 da disciplina de Sistemas Operacionais I, composto por:

  - [Eduardo Wiest](https://github.com/OdraudeNh)
  - [Matheus R. Kautzmann](https://github.com/mkautzmann/)
  - [Rômulo Alves](https://github.com/romuloalves)
  - [Ubiratan Dias](https://github.com/ubiratandias)

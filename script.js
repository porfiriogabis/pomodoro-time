// Pega os elementos da página
const tempoEl = document.getElementById("tempo");
const progressoEl = document.getElementById("progresso");
const btnIniciar = document.getElementById("btn-iniciar");
const btnZerar = document.getElementById("btn-zerar");
const modos = document.querySelectorAll(".modo");
const contagemEl = document.getElementById("contagem");
const tarefaEl = document.getElementById("tarefa");

const CIRCUNFERENCIA = 565.5; // 2 * π * raio do círculo (r = 90)

let duracaoTotal = 25 * 60;   // em segundos
let restante = duracaoTotal;
let intervalo = null;         // guarda o cronômetro quando está rodando
let modoAtual = "foco";

// ---- Contador de tomates do dia (salvo no navegador) ----
function chaveDeHoje() {
  return "tomates-" + new Date().toISOString().slice(0, 10);
}
function lerContagem() {
  return Number(localStorage.getItem(chaveDeHoje())) || 0;
}
function somarTomate() {
  localStorage.setItem(chaveDeHoje(), lerContagem() + 1);
  contagemEl.textContent = lerContagem();
} 

// ---- Mostra o tempo na tela ----
function atualizarTela() {
  const min = String(Math.floor(restante / 60)).padStart(2, "0");
  const seg = String(restante % 60).padStart(2, "0");
  tempoEl.textContent = `${min}:${seg}`;
  document.title = `${min}:${seg} - Tomate Foco`;

  const fracao = restante / duracaoTotal;
  progressoEl.style.strokeDashoffset = CIRCUNFERENCIA * (1 - fracao);
}

// ---- Som simples quando o tempo acaba ----
function tocarAviso() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.frequency.value = 660;
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

function parar() {
  clearInterval(intervalo);
  intervalo = null;
  btnIniciar.textContent = "Iniciar";
}

function iniciarOuPausar() {
  if (intervalo) {
    parar();
    return;
  }
  btnIniciar.textContent = "Pausar";
  intervalo = setInterval(() => {
    restante--;
    atualizarTela();
    if (restante <= 0) {
      parar();
      tocarAviso();
      document.title = "Acabou o tempo! - Tomate Foco";
      if (modoAtual === "foco") somarTomate();
    }
  }, 1000);
}

function zerar() {
  parar();
  restante = duracaoTotal;
  atualizarTela();
}

// ---- Troca entre Foco / Pausa curta / Pausa longa ----
modos.forEach((botao, i) => {
  botao.addEventListener("click", () => {
    modos.forEach((b) => b.classList.remove("ativo"));
    botao.classList.add("ativo");
    modoAtual = i === 0 ? "foco" : "pausa";
    duracaoTotal = Number(botao.dataset.minutos) * 60;
    zerar();
  });
});

btnIniciar.addEventListener("click", iniciarOuPausar);
btnZerar.addEventListener("click", zerar);

// Lembra a última tarefa digitada
tarefaEl.value = localStorage.getItem("ultima-tarefa") || "";
tarefaEl.addEventListener("input", () => {
  localStorage.setItem("ultima-tarefa", tarefaEl.value);
});

contagemEl.textContent = lerContagem();
atualizarTela();

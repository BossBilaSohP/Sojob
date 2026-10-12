// @ts-nocheck
"use strict";

const CHAVE_STORAGE = "usuarios_registados";
const PAGINA_LOGIN = "login.html";

const form = document.getElementById("formRegisto");
const campos = {
  nome: document.getElementById("nome"),
  email: document.getElementById("email"),
  telefone: document.getElementById("telefone"),
  nascimento: document.getElementById("nascimento"),
  senha: document.getElementById("senha"),
  confirmar: document.getElementById("confirmar"),
  termos: document.getElementById("termos"),
};
const barra = document.getElementById("barraForca");
const textoForca = document.getElementById("textoForca");
const caixaMsg = document.getElementById("mensagem");
const btnEnviar = document.getElementById("btnEnviar");

// Link de exemplo (href="#") não deve saltar para o topo
document.querySelectorAll('a[href="#"]').forEach((a) => {
  a.addEventListener("click", (e) => e.preventDefault());
});

/* ---------- Utilitários ---------- */

function lerUsuarios() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || [];
  } catch (e) {
    return [];
  }
}

function guardarUsuarios(lista) {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
}

function paraHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function gerarSal() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return paraHex(bytes);
}

async function hashSenha(senha, sal) {
  const dados = new TextEncoder().encode(sal + senha);
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return paraHex(new Uint8Array(hash));
}

function idadeEm(dataISO) {
  const hoje = new Date();
  const nasc = new Date(dataISO);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function mostrarErro(campo, msg) {
  const el = document.getElementById("erro-" + campo);
  const input = campos[campo];
  el.textContent = msg;
  input.classList.toggle("invalido", !!msg);
  input.classList.toggle("valido", !msg && input.value.trim() !== "");
  return !msg;
}

/* ---------- Validações ---------- */

const validadores = {
  nome() {
    const v = campos.nome.value.trim().replace(/\s+/g, " ");
    if (v.length < 3) return mostrarErro("nome", "Informe o nome completo.");
    if (!/^[\p{L}][\p{L}' .-]+$/u.test(v)) return mostrarErro("nome", "O nome contém caracteres inválidos.");
    if (v.split(" ").length < 2) return mostrarErro("nome", "Informe nome e apelido.");
    return mostrarErro("nome", "");
  },

  email() {
    const v = campos.email.value.trim().toLowerCase();
    if (!v) return mostrarErro("email", "Informe o e-mail.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return mostrarErro("email", "E-mail inválido.");
    if (lerUsuarios().some((u) => u.email === v)) return mostrarErro("email", "Este e-mail já está registado.");
    return mostrarErro("email", "");
  },

  telefone() {
    const digitos = campos.telefone.value.replace(/\D/g, "");
    if (!digitos) return mostrarErro("telefone", "Informe o telefone.");
    if (digitos.length < 9 || digitos.length > 15) return mostrarErro("telefone", "Telefone inválido (9 a 15 dígitos).");
    return mostrarErro("telefone", "");
  },

  nascimento() {
    const v = campos.nascimento.value;
    if (!v) return mostrarErro("nascimento", "Informe a data.");
    if (new Date(v) > new Date()) return mostrarErro("nascimento", "Data no futuro.");
    const idade = idadeEm(v);
    if (idade < 18) return mostrarErro("nascimento", "É necessário ter 18 anos ou mais.");
    if (idade > 120) return mostrarErro("nascimento", "Data inválida.");
    return mostrarErro("nascimento", "");
  },

  senha() {
    const v = campos.senha.value;
    if (v.length < 8) return mostrarErro("senha", "A senha deve ter pelo menos 8 caracteres.");
    if (!/[a-z]/.test(v) || !/[A-Z]/.test(v)) return mostrarErro("senha", "Use letras maiúsculas e minúsculas.");
    if (!/\d/.test(v)) return mostrarErro("senha", "Inclua pelo menos um número.");
    return mostrarErro("senha", "");
  },

  confirmar() {
    if (!campos.confirmar.value) return mostrarErro("confirmar", "Confirme a senha.");
    if (campos.confirmar.value !== campos.senha.value) return mostrarErro("confirmar", "As senhas não coincidem.");
    return mostrarErro("confirmar", "");
  },

  termos() {
    const ok = campos.termos.checked;
    document.getElementById("erro-termos").textContent = ok ? "" : "É necessário aceitar os termos.";
    return ok;
  },
};

/* ---------- Força da senha ---------- */

function atualizarForca() {
  const s = campos.senha.value;
  let p = 0;
  if (s.length >= 8) p++;
  if (s.length >= 12) p++;
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) p++;
  if (/\d/.test(s)) p++;
  if (/[^A-Za-z0-9]/.test(s)) p++;
  if (!s) p = 0;

  const niveis = [
    { txt: "Use letras maiúsculas, minúsculas, números e símbolos.", cor: "#dc2626" },
    { txt: "Muito fraca", cor: "#dc2626" },
    { txt: "Fraca", cor: "#f97316" },
    { txt: "Razoável", cor: "#eab308" },
    { txt: "Forte", cor: "#22c55e" },
    { txt: "Muito forte", cor: "#16a34a" },
  ];
  barra.style.width = (p / 5) * 100 + "%";
  barra.style.background = niveis[p].cor;
  textoForca.textContent = p === 0 ? niveis[0].txt : "Força da senha: " + niveis[p].txt;
}

/* ---------- Máscara de telefone ---------- */

campos.telefone.addEventListener("input", () => {
  let d = campos.telefone.value.replace(/\D/g, "").slice(0, 15);
  if (d.length <= 9) {
    d = d.replace(/^(\d{2})(\d{0,3})(\d{0,4}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
  }
  campos.telefone.value = d;
});

/* ---------- Eventos ---------- */

Object.keys(validadores).forEach((nome) => {
  const el = campos[nome];
  if (el.type === "checkbox") {
    el.addEventListener("change", validadores[nome]);
  } else {
    el.addEventListener("blur", validadores[nome]);
    el.addEventListener("input", () => {
      if (el.classList.contains("invalido")) validadores[nome]();
    });
  }
});

campos.senha.addEventListener("input", () => {
  atualizarForca();
  if (campos.confirmar.value) validadores.confirmar();
});

document.querySelectorAll(".ver").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.alvo);
    const mostrar = input.type === "password";
    input.type = mostrar ? "text" : "password";
    btn.classList.toggle("ativo", mostrar);
  });
});

function mensagem(tipo, texto) {
  caixaMsg.className = "mensagem " + tipo;
  caixaMsg.textContent = texto;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  caixaMsg.className = "mensagem";

  const resultados = Object.keys(validadores).map((n) => validadores[n]());
  if (resultados.includes(false)) {
    mensagem("falha", "Corrija os campos destacados e tente novamente.");
    const primeiro = form.querySelector(".invalido");
    if (primeiro) primeiro.focus();
    return;
  }

  btnEnviar.disabled = true;
  document.getElementById("textoBtn").textContent = "A criar conta...";

  try {
    const sal = gerarSal();
    const senhaHash = await hashSenha(campos.senha.value, sal);

    const usuario = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      nome: campos.nome.value.trim().replace(/\s+/g, " "),
      email: campos.email.value.trim().toLowerCase(),
      telefone: campos.telefone.value.replace(/\D/g, ""),
      nascimento: campos.nascimento.value,
      sal: sal,
      senhaHash: senhaHash,
      criadoEm: new Date().toISOString(),
    };

    const lista = lerUsuarios();
    lista.push(usuario);
    guardarUsuarios(lista);

    form.reset();
    Object.values(campos).forEach((c) => c.classList.remove("valido", "invalido"));
    atualizarForca();
    try {
      sessionStorage.setItem("email_novo", usuario.email);
    } catch (e) {}
    mensagem("sucesso", "Conta criada com sucesso! A redirecionar para o login...");

    setTimeout(() => {
      window.location.href = PAGINA_LOGIN;
    }, 2000);
  } catch (err) {
    console.error(err);
    mensagem("falha", "Não foi possível concluir o registo. Tente abrir o site por http://localhost ou https.");
    btnEnviar.disabled = false;
    document.getElementById("textoBtn").textContent = "Criar conta";
  }
});

campos.nascimento.max = new Date().toISOString().split("T")[0];

// @ts-nocheck
"use strict";

/*
  Login ligado ao registo (usa os dados guardados por registo.js).
  Colocar em login.html, antes de </body>:
  <script src="scripts/auth.js"></script>
*/
(function () {
  const CHAVE_USUARIOS = "usuarios_registados";
  const CHAVE_SESSAO = "sessao_usuario";
  const PAGINA_DESTINO = "index.html";
  const MAX_TENTATIVAS = 5;
  const BLOQUEIO_MS = 30000;

  const campoEmail =
    document.querySelector('input[type="email"]') ||
    document.querySelector('input[name="email"], #email');
  const campoSenha = document.querySelector('input[type="password"]');
  if (!campoEmail || !campoSenha) return;

  const form = campoEmail.closest("form");
  const lembrar = form ? form.querySelector('input[type="checkbox"]') : null;

  // Se já existe sessão, vai direto para o destino
  try {
    if (localStorage.getItem(CHAVE_SESSAO) || sessionStorage.getItem(CHAVE_SESSAO)) {
      window.location.replace(PAGINA_DESTINO);
      return;
    }
  } catch (e) {}

  // Preenche o e-mail acabado de registar
  try {
    const novo = sessionStorage.getItem("email_novo");
    if (novo) {
      campoEmail.value = novo;
      sessionStorage.removeItem("email_novo");
      campoSenha.focus();
    }
  } catch (e) {}

  /* ---------- Mensagem de erro ---------- */
  let caixa = document.getElementById("mensagemLogin");
  if (!caixa) {
    caixa = document.createElement("div");
    caixa.id = "mensagemLogin";
    caixa.setAttribute("role", "alert");
    caixa.style.cssText =
      "display:none;padding:12px 14px;border-radius:12px;margin:14px 0;font-size:0.95rem;";
    const alvo = form ? form.querySelector('button[type="submit"], button:not([type])') : null;
    if (alvo) alvo.parentNode.insertBefore(caixa, alvo);
    else (form || document.body).appendChild(caixa);
  }

  function aviso(tipo, texto) {
    caixa.textContent = texto;
    caixa.style.display = "block";
    caixa.style.background = tipo === "ok" ? "#dcfce7" : "#fee2e2";
    caixa.style.color = tipo === "ok" ? "#166534" : "#991b1b";
  }

  /* ---------- Utilitários ---------- */
  function lerUsuarios() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
    } catch (e) {
      return [];
    }
  }

  async function hashSenha(senha, sal) {
    const dados = new TextEncoder().encode(sal + senha);
    const hash = await crypto.subtle.digest("SHA-256", dados);
    return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
  }

  function bloqueadoAte() {
    return Number(sessionStorage.getItem("login_bloqueio") || 0);
  }

  /* ---------- Login ---------- */
  async function entrar(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const agora = Date.now();
    if (bloqueadoAte() > agora) {
      const seg = Math.ceil((bloqueadoAte() - agora) / 1000);
      aviso("erro", "Demasiadas tentativas. Aguarde " + seg + " segundos.");
      return;
    }

    const email = campoEmail.value.trim().toLowerCase();
    const senha = campoSenha.value;

    if (!email || !senha) {
      aviso("erro", "Preencha o e-mail e a palavra-passe.");
      return;
    }

    try {
      const usuario = lerUsuarios().find((u) => u.email === email);
      let ok = false;
      if (usuario) {
        ok = (await hashSenha(senha, usuario.sal)) === usuario.senhaHash;
      }

      if (!ok) {
        const falhas = Number(sessionStorage.getItem("login_falhas") || 0) + 1;
        sessionStorage.setItem("login_falhas", String(falhas));
        if (falhas >= MAX_TENTATIVAS) {
          sessionStorage.setItem("login_bloqueio", String(Date.now() + BLOQUEIO_MS));
          sessionStorage.setItem("login_falhas", "0");
          aviso("erro", "Demasiadas tentativas. Aguarde 30 segundos.");
        } else {
          aviso("erro", "E-mail ou palavra-passe incorretos.");
        }
        return;
      }

      sessionStorage.setItem("login_falhas", "0");
      const sessao = JSON.stringify({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        entrouEm: new Date().toISOString(),
      });
      const guardar = lembrar && lembrar.checked ? localStorage : sessionStorage;
      guardar.setItem(CHAVE_SESSAO, sessao);

      aviso("ok", "Bem-vindo(a), " + usuario.nome.split(" ")[0] + "!");
      setTimeout(() => {
        window.location.href = PAGINA_DESTINO;
      }, 800);
    } catch (err) {
      console.error(err);
      aviso("erro", "Erro ao entrar. Abra o site por http://localhost ou https.");
    }
  }

  if (form) form.addEventListener("submit", entrar, true);
})();

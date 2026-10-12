/* =========================================================
   JS DA PÁGINA login.html
   ========================================================= */

$(document).ready(function () {

    const LS_USERS  = "sojob_users";    // utilizadores registados
    const LS_SESSAO = "sojob_sessao";   // sessão ativa

    /* ---------------------------------------------------------
       1) MOSTRAR / OCULTAR PALAVRA-PASSE (olho)
       --------------------------------------------------------- */
    $("#toggle-senha").on("click", function () {
        const $senha = $("#login-senha");
        const mostrar = $senha.attr("type") === "password";
        $senha.attr("type", mostrar ? "text" : "password");
        $(this).find("ion-icon").attr(
            "name",
            mostrar ? "eye-off-outline" : "eye-outline"
        );
    });

    /* ---------------------------------------------------------
       2) "ESQUECI A PALAVRA-PASSE" — aviso simples
       (substitua por envio real de e-mail no backend)
       --------------------------------------------------------- */
    $("#esqueci-senha").on("click", function (e) {
        e.preventDefault();
        const email = $("#login-email").val().trim();
        if (email) {
            mensagem("Enviámos instruções de recuperação para " + email + ".", "sucesso");
        } else {
            mensagem("Escreva primeiro o seu e-mail acima.", "erro");
            $("#login-email").trigger("focus");
        }
    });

    /* ---------------------------------------------------------
       3) LOGIN — validação + autenticação (localStorage)
       --------------------------------------------------------- */
    $("#form-login").on("submit", function (e) {
        e.preventDefault();

        const email  = $("#login-email").val().trim().toLowerCase();
        const senha  = $("#login-senha").val();
        const lembrar = $("#login-lembrar").is(":checked");

        // Limpa estado anterior
        $(".campo-login input").removeClass("invalido");

        // Validação
        if (!emailValido(email)) {
            $("#login-email").addClass("invalido").trigger("focus");
            mensagem("Escreva um e-mail válido.", "erro");
            return;
        }
        if (senha.length < 6) {
            $("#login-senha").addClass("invalido").trigger("focus");
            mensagem("A palavra-passe deve ter pelo menos 6 caracteres.", "erro");
            return;
        }

        // Utilizadores registados (registo.html deve guardar em sojob_users)
        const users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");

        // Conta de demonstração caso não haja nenhum utilizador
        if (!users.length) {
            users.push({ nome: "Visitante", email: "demo@sojob.com", senha: "123456" });
            localStorage.setItem(LS_USERS, JSON.stringify(users));
        }

        const user = users.find(u => u.email === email && u.senha === senha);

        if (!user) {
            mensagem("E-mail ou palavra-passe incorretos.", "erro");
            return;
        }

        // Guarda sessão (30 dias se "lembrar", senão sessão do navegador)
        const sessao = { nome: user.nome, email: user.email, data: new Date().toISOString() };
        if (lembrar) {
            localStorage.setItem(LS_SESSAO, JSON.stringify(sessao));
        } else {
            sessionStorage.setItem(LS_SESSAO, JSON.stringify(sessao));
        }

        mensagem("Login efetuado! A redirecionar...", "sucesso");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 900);
    });

    /* ---------------------------------------------------------
       4) Se já estiver logado, vai direto para o início
       --------------------------------------------------------- */
    const sessao = localStorage.getItem(LS_SESSAO) || sessionStorage.getItem(LS_SESSAO);
    if (sessao) {
        window.location.href = "index.html";
    }

    /* ---------------------------------------------------------
       FUNÇÕES AUXILIARES
       --------------------------------------------------------- */
    function emailValido(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function mensagem(texto, tipo) {
        const $caixa = $("#login-mensagem");
        $caixa.text(texto).attr("class", tipo).stop(true).fadeIn(200);
        $caixa.delay(5000).fadeOut(400);
    }

});
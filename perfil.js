/* =========================================================
   JS DA PÁGINA perfil.html
   ========================================================= */

$(document).ready(function () {

    /* ---------------------------------------------------------
       1) BOTÃO SEGUIR / DEIXAR DE SEGUIR
       --------------------------------------------------------- */
    $("#btn-seguir").on("click", function () {
        const aSeguir = $(this).toggleClass("seguindo").hasClass("seguindo");
        $(this).html(
            aSeguir
                ? '<ion-icon name="checkmark-outline"></ion-icon> A seguir'
                : '<ion-icon name="person-add-outline"></ion-icon> Seguir'
        );
    });

    /* ---------------------------------------------------------
       2) MÉRITOS — clique mostra pequena descrição
       --------------------------------------------------------- */
    $(".merito").on("click", function () {
        const titulo = $(this).find("span").text();
        const descricoes = {
            "Top Artista": "Entre os 10 profissionais melhor avaliados da plataforma.",
            "100+ Trabalhos": "Concluiu mais de 100 serviços com sucesso.",
            "Pontual": "Cumpre os prazos em 98% dos serviços.",
            "Recomendado": "Recomendado por mais de 50 clientes.",
            "Verificado": "Documentos e identidade confirmados pela SOJOB."
        };
        alert(titulo + "\n\n" + (descricoes[titulo] || "Mérito conquistado na plataforma."));
    });

    /* ---------------------------------------------------------
       3) PORTFÓLIO — clique na obra abre a imagem em separado
       --------------------------------------------------------- */
    $(".portfolio-item").on("click", function () {
        const src = $(this).find("img").attr("src");
        window.open(src, "_blank");
    });

    /* ---------------------------------------------------------
       4) CARREGAR DADOS DO UTILIZADOR LOGADO (se existir sessão)
       --------------------------------------------------------- */
    const sessao =
        JSON.parse(localStorage.getItem("sojob_sessao") || "null") ||
        JSON.parse(sessionStorage.getItem("sojob_sessao") || "null");

    if (sessao && sessao.nome) {
        $("#perfil-nome-linha h1").text(sessao.nome);
        // Cria @utilizador a partir do nome: "Ana Silva" -> "@anasilva"
        const user = sessao.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");
        $("#perfil-user").text("@" + user);
        $("#perfil-foto img").attr("alt", "Foto de perfil de " + sessao.nome);
    }

});
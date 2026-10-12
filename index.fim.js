/* ============================================================
   FIM DO index.js — cole no final do ficheiro, a seguir a
   "/* ===== ADICIONAR COMENTÁRIO — funcional ===== *\/"
   (o ficheiro que enviou estava cortado nesta parte)
   ============================================================ */
$(document).ready(function () {

    const LS_POSTS = "sojob_posts";

    function getPosts() {
        return JSON.parse(localStorage.getItem(LS_POSTS) || "[]");
    }
    function savePosts(posts) {
        localStorage.setItem(LS_POSTS, JSON.stringify(posts));
    }

    /* ===== ADICIONAR COMENTÁRIO ===== */
    $("#feed").on("submit", ".form-comentario", function (e) {
        e.preventDefault();
        const $input = $(this).find("input");
        const texto = $input.val().trim();
        if (!texto) return;

        const id = $(this).closest(".post").data("id");
        const posts = getPosts();
        const post = posts.find(p => p.id === id);
        if (!post) return;

        post.comentarios.push({ autor: "Eu", texto: texto });
        savePosts(posts);

        // Atualiza só a zona de comentários deste post
        const comentariosHTML = post.comentarios.map(c =>
            `<div class="comentario"><strong>${c.autor}</strong>${c.texto}</div>`
        ).join("");
        $(this).closest(".post-comentarios")
            .find(".comentario, .sem-comentarios").remove();
        $(this).before(comentariosHTML);
        $(this).closest(".post")
            .find(".acao-comentarios")
            .html(`<ion-icon name="chatbubble-outline"></ion-icon> ${post.comentarios.length}`);
        $input.val("");
    });

    /* ===== APAGAR POST (mantém pressionado o cabeçalho) ===== */
    let timerApagar = null;
    $("#feed").on("mousedown touchstart", ".post-cabecalho", function () {
        const id = $(this).closest(".post").data("id");
        timerApagar = setTimeout(() => {
            if (confirm("Apagar esta publicação?")) {
                savePosts(getPosts().filter(p => p.id !== id));
                location.reload();
            }
        }, 800);
    });
    $("#feed").on("mouseup mouseleave touchend", ".post-cabecalho", () => {
        clearTimeout(timerApagar);
    });

    /* ===== ARRANQUE: desenha o feed ao carregar a página ===== */
    (function init() {
        if ($("#feed").length) {
            // Chama a função renderFeed definida acima no ficheiro
            if (typeof renderFeed === "function") renderFeed();
        }
    })();

});
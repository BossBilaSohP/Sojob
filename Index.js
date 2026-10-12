$(document).ready(function () {
    "use strict";

    /* =========================================
       1. MENU PRINCIPAL — TELEMÓVEL
    ========================================= */

    function fecharMenuPrincipal() {
        $("#menu-principal").removeClass("aberto");
        $("#menu ion-icon").attr("name", "menu-outline");
    }

    $("#menu").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const aberto = $("#menu-principal").toggleClass("aberto")
            .hasClass("aberto");

        $(this).find("ion-icon").attr(
            "name",
            aberto ? "close-outline" : "menu-outline"
        );
    });

    $("#menu-principal a").on("click", function () {
        fecharMenuPrincipal();
    });


    /* =========================================
       2. VOLTAR AO TOPO
    ========================================= */

    $("#btn-topo").on("click", function () {
        $("html, body").animate(
            { scrollTop: 0 },
            400
        );
    });


    /* =========================================
       3. MENU DE AÇÕES — BOTÃO +
    ========================================= */

    function fecharMenuAcoes() {
        $("#menu-acoes, #fundo-menu").removeClass("ativo");
    }

    $("#btn-mais").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const aberto = $("#menu-acoes").hasClass("ativo");

        fecharMenuAcoes();

        if (!aberto) {
            $("#menu-acoes, #fundo-menu").addClass("ativo");
        }
    });

    $("#fundo-menu").on("click", function () {
        fecharMenuAcoes();
    });

    $("#menu-acoes").on("click", function (e) {
        e.stopPropagation();
    });


    /* =========================================
       4. CÂMERA DO TELEMÓVEL
    ========================================= */

    $("#btn-camera, #acao-camera").on("click", function (e) {
        e.preventDefault();

        fecharMenuAcoes();

        const inputCamera = $("#input-camera");

        if (inputCamera.length) {
            inputCamera.trigger("click");
        }
    });


    /* =========================================
       5. PESQUISA NO MENU
    ========================================= */

    const itensPesquisa = $("#menu-principal li a").map(function () {
        return {
            nome: $(this).text().trim(),
            href: $(this).attr("href") || "#"
        };
    }).get();

    function escaparHTML(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, function (caractere) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[caractere];
        });
    }

    $("#campo-pesquisa").on("input", function () {
        const termo = $(this).val().toLowerCase().trim();
        const resultados = $("#resultados-pesquisa");

        resultados.empty();

        if (!termo) {
            resultados.removeClass("ativo");
            return;
        }

        const encontrados = itensPesquisa.filter(function (item) {
            return item.nome.toLowerCase().includes(termo);
        });

        if (encontrados.length) {
            encontrados.forEach(function (item) {
                const nome = escaparHTML(item.nome);
                const href = escaparHTML(item.href);

                resultados.append(
                    `<li><a href="${href}">${nome}</a></li>`
                );
            });
        } else {
            resultados.append(
                "<li><a href='#'>Nada encontrado</a></li>"
            );
        }

        resultados.addClass("ativo");
    });

    $("#resultados-pesquisa").on("click", "a", function () {
        $("#resultados-pesquisa").removeClass("ativo");
        $("#campo-pesquisa").val("");
    });

    $(document).on("click", function (e) {
        if (!$(e.target).closest("#caixa-pesquisa").length) {
            $("#resultados-pesquisa").removeClass("ativo");
        }

        if (!$(e.target).closest("#menu-principal, #icone-menu").length) {
            fecharMenuPrincipal();
        }
    });


    /* =========================================
       6. SISTEMA DE PUBLICAÇÕES — FEED
       Guarda publicações neste dispositivo.
    ========================================= */

    const CHAVE_POSTS = "sojob_posts";

    function obterPosts() {
        try {
            const dados = JSON.parse(
                localStorage.getItem(CHAVE_POSTS) || "[]"
            );

            if (!Array.isArray(dados)) {
                return [];
            }

            return dados.map(function (post) {
                post.reacoes = post.reacoes || {
                    gosto: 0,
                    amei: 0,
                    naogosto: 0
                };

                post.minhasReacoes = post.minhasReacoes || {};
                post.comentarios = Array.isArray(post.comentarios)
                    ? post.comentarios
                    : [];

                return post;
            });
        } catch (erro) {
            console.error("Erro ao ler publicações:", erro);
            return [];
        }
    }

    function guardarPosts(posts) {
        try {
            localStorage.setItem(CHAVE_POSTS, JSON.stringify(posts));
            return true;
        } catch (erro) {
            console.error("Erro ao guardar publicações:", erro);
            alert(
                "Não foi possível guardar a publicação. " +
                "O armazenamento pode estar cheio."
            );
            return false;
        }
    }


    /* =========================================
       7. PUBLICAR FOTO OU VÍDEO
       Um único evento para a câmara.
    ========================================= */

    function publicarNoFeed(tipo, src) {
        const legenda = prompt("Escreva uma legenda para a publicação:");

        if (legenda === null) {
            return;
        }

        const posts = obterPosts();

        posts.unshift({
            id: Date.now(),
            tipo: tipo,
            src: src,
            texto: legenda.trim(),
            autor: "Eu",
            data: new Date().toISOString(),
            reacoes: {
                gosto: 0,
                amei: 0,
                naogosto: 0
            },
            minhasReacoes: {},
            comentarios: []
        });

        if (guardarPosts(posts)) {
            renderFeed();

            $("html, body").animate(
                { scrollTop: 0 },
                300
            );
        }
    }

    $("#input-camera").on("change", function () {
        const input = this;
        const ficheiro = input.files && input.files[0];

        if (!ficheiro) {
            return;
        }

        // Aceitar apenas imagens e vídeos.
        if (
            !ficheiro.type.startsWith("image/") &&
            !ficheiro.type.startsWith("video/")
        ) {
            alert("Escolha uma imagem ou um vídeo.");
            input.value = "";
            return;
        }

        // Vídeo: limite de 4 MB.
        if (ficheiro.type.startsWith("video/")) {
            if (ficheiro.size > 4 * 1024 * 1024) {
                alert("Vídeo muito grande. O limite é 4 MB.");
                input.value = "";
                return;
            }

            const leitor = new FileReader();

            leitor.onload = function (e) {
                publicarNoFeed("video", e.target.result);
                input.value = "";
            };

            leitor.onerror = function () {
                alert("Não foi possível ler o vídeo.");
                input.value = "";
            };

            leitor.readAsDataURL(ficheiro);
            return;
        }

        // Foto: redimensionar e comprimir.
        const imagem = new Image();
        const urlTemporario = URL.createObjectURL(ficheiro);

        imagem.onload = function () {
            const MAX = 1280;

            let largura = imagem.width;
            let altura = imagem.height;

            if (largura > MAX || altura > MAX) {
                const escala = MAX / Math.max(largura, altura);

                largura = Math.round(largura * escala);
                altura = Math.round(altura * escala);
            }

            const canvas = document.createElement("canvas");
            canvas.width = largura;
            canvas.height = altura;

            const contexto = canvas.getContext("2d");

            if (!contexto) {
                URL.revokeObjectURL(urlTemporario);
                alert("Não foi possível processar a foto.");
                input.value = "";
                return;
            }

            contexto.drawImage(imagem, 0, 0, largura, altura);

            try {
                const fotoComprimida = canvas.toDataURL(
                    "image/jpeg",
                    0.8
                );

                publicarNoFeed("foto", fotoComprimida);
            } catch (erro) {
                alert("Não foi possível processar esta foto.");
            }

            URL.revokeObjectURL(urlTemporario);
            input.value = "";
        };

        imagem.onerror = function () {
            URL.revokeObjectURL(urlTemporario);
            alert("Não foi possível abrir esta imagem.");
            input.value = "";
        };

        imagem.src = urlTemporario;
    });


    /* =========================================
       8. MOSTRAR AS PUBLICAÇÕES
    ========================================= */

    function renderFeed() {
        const feed = $("#feed");

        // Algumas páginas, como servicos.html,
        // não têm um elemento #feed.
        if (!feed.length) {
            return;
        }

        const posts = obterPosts();

        if (!posts.length) {
            feed.html(`
                <div class="feed-vazio">
                    <ion-icon
                        name="images-outline"
                        style="font-size:48px"
                    ></ion-icon>

                    <p>
                        O feed está vazio.<br>
                        Toque em <strong>+</strong> ou na
                        <strong>Câmera</strong> para publicar
                        a primeira foto!
                    </p>
                </div>
            `);

            return;
        }

        const htmlPosts = posts.map(function (post) {
            const autor = escaparHTML(post.autor || "Utilizador");
            const texto = escaparHTML(post.texto || "");
            const data = escaparHTML(
                new Date(post.data).toLocaleString("pt-BR")
            );

            const src = escaparHTML(post.src || "");
            const reacoes = post.reacoes;
            const comentarios = post.comentarios;

            const media = post.tipo === "video"
                ? `<video src="${src}" controls playsinline></video>`
                : `<img src="${src}" alt="Publicação">`;

            const listaComentarios = comentarios.map(function (comentario) {
                return `
                    <div class="comentario">
                        <strong>${escaparHTML(comentario.autor || "Utilizador")}</strong>
                        ${escaparHTML(comentario.texto || "")}
                    </div>
                `;
            }).join("");

            const gostoAtivo = post.minhasReacoes.gosto ? "ativo" : "";
            const ameiAtivo = post.minhasReacoes.amei ? "ativo" : "";
            const naoGostoAtivo = post.minhasReacoes.naogosto
                ? "ativo"
                : "";

            return `
                <article class="post" data-id="${post.id}">

                    <div class="post-cabecalho">
                        <span class="post-avatar">
                            ${escaparHTML(autor.charAt(0).toUpperCase())}
                        </span>

                        <div>
                            <div class="post-autor">${autor}</div>
                            <div class="post-data">${data}</div>
                        </div>
                    </div>

                    <div class="post-midia">${media}</div>

                    ${texto ? `<p class="post-texto">${texto}</p>` : ""}

                    <div class="post-acoes">

                        <button type="button" class="acao gosto ${gostoAtivo}">
                            <ion-icon name="thumbs-up-outline"></ion-icon>
                            ${reacoes.gosto}
                        </button>

                        <button type="button" class="acao amei ${ameiAtivo}">
                            <ion-icon name="heart-outline"></ion-icon>
                            ${reacoes.amei}
                        </button>

                        <button type="button" class="acao naogosto ${naoGostoAtivo}">
                            <ion-icon name="thumbs-down-outline"></ion-icon>
                            ${reacoes.naogosto}
                        </button>

                        <button type="button" class="acao acao-comentarios">
                            <ion-icon name="chatbubble-outline"></ion-icon>
                            ${comentarios.length}
                        </button>

                    </div>

                    <div class="post-comentarios">
                        ${listaComentarios ||
                            '<div class="comentario">Sem comentários ainda.</div>'}

                        <form class="form-comentario">
                            <input
                                type="text"
                                placeholder="Escreva um comentário..."
                                required
                            >

                            <button type="submit">OK</button>
                        </form>
                    </div>

                </article>
            `;
        }).join("");

        feed.html(htmlPosts);
    }


    /* =========================================
       9. REAÇÕES: GOSTO, AMEI E NÃO GOSTO
    ========================================= */

    $("#feed").on(
        "click",
        ".acao.gosto, .acao.amei, .acao.naogosto",
        function () {
            const botao = $(this);

            const tipo = botao.hasClass("gosto")
                ? "gosto"
                : botao.hasClass("amei")
                    ? "amei"
                    : "naogosto";

            const id = botao.closest(".post").attr("data-id");
            const posts = obterPosts();

            const post = posts.find(function (item) {
                return String(item.id) === String(id);
            });

            if (!post) {
                return;
            }

            const ativo = !!post.minhasReacoes[tipo];

            post.minhasReacoes[tipo] = !ativo;
            post.reacoes[tipo] = Math.max(
                0,
                (Number(post.reacoes[tipo]) || 0) + (ativo ? -1 : 1)
            );

            if (guardarPosts(posts)) {
                renderFeed();
            }
        }
    );


    /* =========================================
       10. ABRIR E FECHAR COMENTÁRIOS
    ========================================= */

    $("#feed").on("click", ".acao-comentarios", function () {
        $(this)
            .closest(".post")
            .find(".post-comentarios")
            .toggleClass("aberto");
    });


    /* =========================================
       11. ADICIONAR COMENTÁRIOS
    ========================================= */

    $("#feed").on("submit", ".form-comentario", function (e) {
        e.preventDefault();

        const formulario = $(this);
        const texto = formulario.find("input").val().trim();

        if (!texto) {
            return;
        }

        const id = formulario.closest(".post").attr("data-id");
        const posts = obterPosts();

        const post = posts.find(function (item) {
            return String(item.id) === String(id);
        });

        if (!post) {
            return;
        }

        post.comentarios.push({
            autor: "Eu",
            texto: texto,
            data: new Date().toISOString()
        });

        if (guardarPosts(posts)) {
            renderFeed();

            $(`.post[data-id="${id}"] .post-comentarios`)
                .addClass("aberto");
        }
    });


    /* =========================================
       12. INICIAR
    ========================================= */

    renderFeed();

});
 /* =========================================================
   JS DA PÁGINA servicos.html
   ========================================================= */

$(document).ready(function () {

    /* ---------------------------------------------------------
       1) BOTÃO "PEDIR SERVIÇO" DE CADA CARTÃO
       - Rola suavemente até ao formulário
       - Pré-seleciona o serviço no <select>
       --------------------------------------------------------- */

    $('.btn-pedir').on('click', function (e) {

        // Nome do serviço = texto do <h2> do mesmo cartão
        var servico = $(this).siblings('h2').text().trim();

        // Pré-seleciona no campo <select id="tipo-servico">
        $('#tipo-servico option').each(function () {
            if ($(this).text().trim() === servico) {
                $(this).prop('selected', true);
            }
        });

        // Rola suavemente até ao formulário
        if ($('#pedido').length) {
            e.preventDefault(); // evita o salto instantâneo do href="#pedido"

            $('html, body').animate({
                scrollTop: $('#pedido').offset().top - 20
            }, 500);

            // Foco no campo nome para o utilizador começar a preencher
            setTimeout(function () {
                $('#nome').trigger('focus');
            }, 550);
        }
    });


    /* ---------------------------------------------------------
       2) PESQUISA RÁPIDA DE SERVIÇOS
       - Filtra os cartões conforme o texto digitado
         na barra de pesquisa (#campo-pesquisa)
       --------------------------------------------------------- */

    $('#campo-pesquisa').on('input', function () {
        var termo = $(this).val().toLowerCase().trim();

        $('.card-servico').each(function () {
            var texto = $(this).text().toLowerCase();
            $(this).toggle(texto.indexOf(termo) > -1);
        });
    });


    /* ---------------------------------------------------------
       3) ENVIO DO FORMULÁRIO DE PEDIDO
       - Valida os campos obrigatórios
       - Mostra mensagem de sucesso
       - Limpa o formulário
       --------------------------------------------------------- */

    $('#form-pedido').on('submit', function (e) {
        e.preventDefault(); // impede o recarregamento da página

        var nome      = $('#nome').val().trim();
        var telefone  = $('#telefone').val().trim();
        var servico   = $('#tipo-servico').val();
        var descricao = $('#descricao').val().trim();

        // Validação simples
        if (!nome || !telefone || !servico) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'erro');
            return;
        }

        // Validação de telefone (mínimo 9 dígitos)
        var telefoneLimpo = telefone.replace(/\D/g, '');
        if (telefoneLimpo.length < 9) {
            mostrarMensagem('O número de telefone parece inválido.', 'erro');
            return;
        }

        /* ===== AQUI FICA O ENVIO REAL =====
        Exemplo com fetch para um servidor:
        fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, telefone, servico, descricao })
        });
        ====================================== */

        mostrarMensagem(
            'Pedido enviado com sucesso! Entraremos em contacto em breve, ' + nome + '.',
            'sucesso'
        );

        // Limpa o formulário
        this.reset();
    });


    /* ---------------------------------------------------------
       4) FUNÇÃO AUXILIAR: MOSTRAR MENSAGEM DE SUCESSO / ERRO
       --------------------------------------------------------- */

    function mostrarMensagem(texto, tipo) {
        var $caixa = $('#mensagem-form');

        // Se ainda não existe, cria
        if (!$caixa.length) {
            $caixa = $('<div id="mensagem-form"></div>');
            $('#form-pedido').before($caixa);
        }

        $caixa
            .text(texto)
            .attr('class', 'mensagem ' + tipo) // .mensagem.sucesso / .mensagem.erro
            .stop(true)
            .fadeIn(200);

        // Esconde automaticamente após 5 segundos
        $caixa.delay(5000).fadeOut(400);
    }

});
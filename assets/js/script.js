const containerInicial = document.getElementById('texto_oracao_inicial');
const containerMisterio = document.getElementById('conteudo_misterio');
let dadosMisterios = null;

// 1. BUSCA OS DADOS NO JSON ASSIM QUE O SITE ABRE
function iniciarSite() {
    fetch('assets/json/misterios.json')
        .then(resposta => {
            if (!resposta.ok) throw new Error("Erro ao carregar o JSON");
            return resposta.json();
        })
        .then(dados => {
            dadosMisterios = dados;

            // Carrega o texto explicativo sobre a história do terço na página principal
            const historia = dados.historia_terco;

            const imagemHTML = historia.imagem
                ? `<img src="${historia.imagem}" alt="${historia.titulo}" class="images_misterio">`
                : '';

            const paragrafosHTML = historia.paragrafos.map(p => `<p>${p}</p>`).join('');

            containerInicial.innerHTML = `<h2>${historia.titulo}</h2>${imagemHTML}${paragrafosHTML}`;

            roteador();
        })
        .catch(erro => console.error("Erro:", erro));
}

// 2. O ROTEADOR (Controla o que aparece na tela baseado na URL)
function roteador() {
    // Rola a tela até o topo sempre que trocar de visualização ou clicar em um mistério
    window.scrollTo(0, 0);
    const paginaAtual = window.location.hash.replace('#', '');

    if (!paginaAtual) {
        containerInicial.style.display = "block"; // Mostra o texto informativo da página inicial
        containerMisterio.style.display = "none";
        document.title = "Terço Online - História do Terço";
    } else {
        containerInicial.style.display = "none";
        containerMisterio.style.display = "block";
        exibirMisterio(paginaAtual);
    }
}

// 3. EXIBE O MISTÉRIO SELECIONADO
function exibirMisterio(chaveMisterio) {
    if (!dadosMisterios) return;

    const misterioSelecionado = dadosMisterios[chaveMisterio];

    if (misterioSelecionado) {
        document.title = `Terço Online - ${misterioSelecionado.titulo}`;

        const itensHTML = misterioSelecionado.itens.map(item => `<li>${item}</li>`).join('');

        containerMisterio.innerHTML = `
            <h3>${misterioSelecionado.titulo}</h3>
            <p class="dias_semana">${misterioSelecionado.dias}</p>
            <img src="${misterioSelecionado.imagem}" alt="${misterioSelecionado.titulo}" class="images_misterio">
            <ul class="lista_misterio">${itensHTML}</ul>
            <br>
            <a href="#" class="btn_voltar">← Voltar para a Página Inicial</a>
        `;
    } else {
        containerMisterio.innerHTML = `<p class="mensagem_ajuda">Mistério não encontrado.</p>`;
    }
}

window.addEventListener('hashchange', roteador);
window.addEventListener('DOMContentLoaded', iniciarSite);
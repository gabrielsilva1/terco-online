const containerInicial = document.getElementById('texto_oracao_inicial');
const containerMisterio = document.getElementById('conteudo_misterio');
let dadosMisterios = null; // Guardará os dados do JSON globalmente

// 1. BUSCA OS DADOS NO JSON ASSIM QUE O SITE ABRE
function iniciarSite() {
    fetch('assets/json/misterios.json')
        .then(resposta => {
            if (!resposta.ok) throw new Error("Erro ao carregar o JSON");
            return resposta.json();
        })
        .then(dados => {
            dadosMisterios = dados; // Salva os dados para usar depois

            // Pega o objeto da oração inicial
            const oracao = dados.oracao_inicial;

            // Verifica se existe o campo "imagem" no JSON e cria a tag HTML correspondente
            // Ela usará a classe "images_misterio" que você já estilizou no CSS
            const imagemHTML = oracao.imagem ? `<img src="${oracao.imagem}" alt="${oracao.titulo}" class="images_misterio">` : '';

            // Mapeia os parágrafos do texto
            const paragrafosHTML = oracao.paragrafos.map(p => `<p>${p}</p>`).join('');

            // Junta tudo dentro do container da oração inicial (Título + Imagem + Textos)
            containerInicial.innerHTML = `<h2>${oracao.titulo}</h2>${imagemHTML}${paragrafosHTML}`;

            // Verifica qual "página" deve exibir logo no primeiro carregamento
            roteador();
        })
        .catch(erro => console.error("Erro:", erro));
}

// 2. O ROTEADOR (Controla o que aparece na tela baseado na URL)
function roteador() {
    // Pega o que está depois da '#' na URL (ex: 'gozosos', 'dolorosos')
    const paginaAtual = window.location.hash.replace('#', '');

    // Se não tiver nada na hash (página inicial)
    if (!paginaAtual) {
        containerInicial.style.display = "block"; // Mostra oração inicial e a imagem nova
        containerMisterio.style.display = "none"; // Esconde os mistérios
        document.title = "Terço Online";
    } else {
        // Se o usuário estiver em uma "página" de mistério
        containerInicial.style.display = "none"; // Esconde a oração inicial
        containerMisterio.style.display = "block"; // Mostra a área do mistério
        exibirMisterio(paginaAtual);
    }
}

// 3. EXIBE O MISTÉRIO SELECIONADO
function exibirMisterio(chaveMisterio) {
    if (!dadosMisterios) return;

    const misterioSelecionado = dadosMisterios[chaveMisterio];

    if (misterioSelecionado) {
        document.title = `Terço Online - ${misterioSelecionado.titulo}`;

        // Mapeia os itens criando elementos da lista
        const itensHTML = misterioSelecionado.itens.map(item => `<li>${item}</li>`).join('');

        containerMisterio.innerHTML = `
            <h3>${misterioSelecionado.titulo}</h3>
            <p class="dias_semana">${misterioSelecionado.dias}</p>
            <img src="${misterioSelecionado.imagem}" alt="${misterioSelecionado.titulo}" class="images_misterio">
            <ul class="lista_misterio">${itensHTML}</ul>
            <br>
            <a href="#" class="btn_voltar">← Voltar para a Oração Inicial</a>
        `;
    } else {
        containerMisterio.innerHTML = `<p class="mensagem_ajuda">Mistério não encontrado.</p>`;
    }
}

// Ouvinte 1: Ativa o roteador toda vez que o usuário clica em um link do menu (muda a hash)
window.addEventListener('hashchange', roteador);

// Ouvinte 2: Roda o fetch inicial assim que o HTML carrega
window.addEventListener('DOMContentLoaded', iniciarSite);
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

            const historia = dados.historia_terco;

            const imagemHTML = historia.imagem
                ? `<img src="${historia.imagem}" alt="${historia.titulo}" class="images_misterio">`
                : '';

            const paragrafosHTML = historia.paragrafos.map(p => {
                const textoLimpinho = p.trim();
                if (textoLimpinho.startsWith('<h') || textoLimpinho.startsWith('<ul')) {
                    return textoLimpinho;
                }
                return `<p>${textoLimpinho}</p>`;
            }).join('');

            containerInicial.innerHTML = `<h2>${historia.titulo}</h2>${imagemHTML}${paragrafosHTML}`;

            roteador();
        })
        .catch(erro => console.error("Erro no carregamento:", erro));
}

// 2. O ROTEADOR
function roteador() {
    window.scrollTo(0, 0);
    const paginaAtual = window.location.hash.replace('#', '');

    if (!paginaAtual) {
        containerInicial.style.display = "block";
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

    const itemSelecionado = dadosMisterios[chaveMisterio];

    if (!itemSelecionado) {
        containerMisterio.innerHTML = `<p class="mensagem_ajuda">Conteúdo não encontrado.</p>`;
        return;
    }

    document.title = `Terço Online - ${itemSelecionado.titulo}`;

    // CASO A: Página de um grupo principal (#gozosos, #dolorosos, #gloriosos)
    if (itemSelecionado.oracoes_iniciais) {
        const imagemHTML = itemSelecionado.imagem
            ? `<img src="${itemSelecionado.imagem}" alt="${itemSelecionado.titulo}" class="images_misterio">`
            : '';

        const oracoesHTML = itemSelecionado.oracoes_iniciais
            .map(oracao => `<li>${oracao}</li>`)
            .join('');

        const linksMisteriosHTML = itemSelecionado.misterios
            .map(m => `
                <li class="card_misterio_individual">
                    <a href="#${m.slug}" class="btn_misterio_link">
                        <strong>${m.numero}:</strong> ${m.titulo}
                    </a>
                </li>
            `)
            .join('');

        containerMisterio.innerHTML = `
            <h3>${itemSelecionado.titulo}</h3>
            <p class="dias_semana">${itemSelecionado.dias}</p>
            ${imagemHTML}

            <h4>Orações Iniciais</h4>
            <ul class="lista_misterio_iniciais">${oracoesHTML}</ul>

            <h4>Contemplação dos Mistérios</h4>
            <ul class="lista_misterios_links">${linksMisteriosHTML}</ul>

            <br>
            <a href="#" class="btn_voltar">← Voltar para a Página Inicial</a>
        `;
    }
    // CASO B: Página de um mistério individual (ex: #gozosos-1, #dolorosos-5)
    else if (itemSelecionado.oracoes) {
        const imagemHTML = itemSelecionado.imagem
            ? `<img src="${itemSelecionado.imagem}" alt="${itemSelecionado.titulo}" class="images_misterio">`
            : '';

        // Orações do mistério + Contador de Ave-Maria
        const oracoesHTML = itemSelecionado.oracoes
            .map(oracao => {
                if (oracao.toLowerCase().includes("ave maria")) {
                    return `
                        <li class="item_ave_maria_contador">
                            <p class="texto_oracao_avemaria">
                                <strong>Ave Maria</strong>, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora de nossa morte. Amém.
                            </p>
                            <div class="painel_contador_inline">
                                <span class="placar_avemaria">Rezadas: <strong id="valor_contador">0</strong> / 10</span>
                                <button id="btn_contar_avemaria" class="btn_contar_inline">+1 Ave-Maria</button>
                            </div>
                        </li>
                    `;
                }
                return `<li>${oracao}</li>`;
            })
            .join('');

        // Verifica se é o 5º mistério da série
        const ehUltimoMisterio = chaveMisterio.endsWith('-5');

        const oracoesFinaisHTML = ehUltimoMisterio ? `
            <hr class="divisor_finais">
            <div class="secao_oracoes_finais">
                <h4>Oração Final</h4>
                <ul class="lista_misterio">
                    <li class="card_oracao_final">
                        <p><strong>Salve Rainha</strong></p>
                        <p>Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos os degredados filhos de Eva. A vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia pois, advogada nossa, esses vossos olhos misericordiosos a nós voltai, e depois deste desterro mostrai-nos Jesus, bendito fruto do vosso ventre. Ó clemente, ó piedosa, ó doce sempre Virgem Maria. Rogai por nós, Santa Mãe de Deus,para que sejamos dignos das promessas de Cristo. Amém.</p>
                    </li>
                    <li class="card_oracao_final sinal_cruz_final">
                        <p><strong>Sinal da Cruz Final ✝</strong></p>
                        <p>Em nome do Pai, e do Filho, e do Espírito Santo. Amém.</p>
                    </li>
                </ul>
            </div>
        ` : '';

        containerMisterio.innerHTML = `
            <h3>${itemSelecionado.titulo}</h3>
            <p class="subtitulo_misterio">${itemSelecionado.subtitulo}</p>
            ${imagemHTML}

            <h4>Orações do Mistério</h4>
            <ul class="lista_misterio">${oracoesHTML}</ul>

            ${oracoesFinaisHTML}

            <br>
            <a href="#${itemSelecionado.grupo}" class="btn_voltar">← Voltar para os ${itemSelecionado.grupo.toUpperCase()}</a>
        `;

        // Lógica do contador da Ave-Maria
        let contagem = 0;
        const btnContar = document.getElementById('btn_contar_avemaria');
        const visorContador = document.getElementById('valor_contador');

        if (btnContar && visorContador) {
            btnContar.addEventListener('click', () => {
                if (contagem < 10) {
                    contagem++;
                    visorContador.innerText = contagem;

                    if (contagem === 10) {
                        btnContar.innerText = "Concluído ✓";
                        btnContar.style.backgroundColor = "#4CAF50";
                        btnContar.style.color = "white";
                        btnContar.disabled = true;
                    }
                }
            });
        }
    }
}
// 4. ESCUTA OS EVENTOS DE INICIALIZAÇÃO E TROCA DE ROTA
window.addEventListener("DOMContentLoaded", iniciarSite);
window.addEventListener("hashchange", roteador);
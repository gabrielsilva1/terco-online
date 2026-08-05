const containerInicial = document.getElementById('texto_oracao_inicial');
const containerMisterio = document.getElementById('conteudo_misterio');
let dadosMisterios = null;

// 1. INICIALIZAÇÃO E CARREGAMENTO
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

// 2. ROLAGEM SUAVE COM DESCONTO DO HEADER FIXO
function rolarParaTopoDoConteudo() {
    const elementoAlvo = document.getElementById('imagem_topo_misterio') || document.querySelector('#conteudo_misterio h3') || document.querySelector('main');

    if (elementoAlvo) {
        elementoAlvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 3. ROTEADOR
function roteador() {
    const paginaAtual = window.location.hash.replace('#', '');

    if (!paginaAtual) {
        containerInicial.style.display = "block";
        containerMisterio.style.display = "none";
        document.title = "Terço Online - História do Terço";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        containerInicial.style.display = "none";
        containerMisterio.style.display = "block";

        // Reinicia a animação de entrada a cada troca de rota
        containerMisterio.classList.remove('animar_entrada');
        void containerMisterio.offsetWidth; // Força reflow no navegador
        containerMisterio.classList.add('animar_entrada');

        exibirMisterio(paginaAtual);
        rolarParaTopoDoConteudo();
    }
}

// 4. EXIBE MISTÉRIO
function exibirMisterio(chaveMisterio) {
    if (!dadosMisterios) return;

    const itemSelecionado = dadosMisterios[chaveMisterio];

    if (!itemSelecionado) {
        containerMisterio.innerHTML = `<p class="mensagem_ajuda">Conteúdo não encontrado.</p>`;
        return;
    }

    document.title = `Terço Online - ${itemSelecionado.titulo}`;

    // CASO A: Grupo Principal (#gozosos, #dolorosos, #gloriosos)
// Substitua o mapeamento das orações no CASO A por este trecho:
    if (itemSelecionado.oracoes_iniciais) {
    const oracoesHTML = itemSelecionado.oracoes_iniciais
        .map(oracao => `
            <li class="item_oracao_inicial card_oracao_interativo">
                <span class="icone_oracao">┼</span>
                <span class="texto_oracao_item">${oracao}</span>
            </li>
        `)
        .join('');

    const linksMisteriosHTML = itemSelecionado.misterios
        .map(m => `
            <li class="card_misterio_item">
                <a href="#${m.slug}" class="btn_misterio_link">
                    <span class="badge_numero">${m.numero}º Mistério</span>
                    <span class="titulo_misterio_card">${m.titulo}</span>
                    <span class="seta_card">→</span>
                </a>
            </li>
        `)
        .join('');

    const menuLateralHTML = itemSelecionado.misterios
        .map(m => `
            <li>
                <a href="#${m.slug}" class="item_menu_lateral">
                    <strong>${m.numero}º</strong> ${m.titulo}
                </a>
            </li>
        `)
        .join('');

    containerMisterio.innerHTML = `
        <div class="layout_grupo_misterios">
            <aside class="sidebar_misterios">
                <h5 class="titulo_sidebar">Mistérios deste Grupo</h5>
                <ul class="lista_sidebar">
                    ${menuLateralHTML}
                </ul>
            </aside>

            <div class="conteudo_grupo_principal">
                <!-- CABEÇALHO CLARO E LIMPO PARA O GRUPO -->
                <div class="hero_grupo_card" id="imagem_topo_misterio">
                    <span class="tag_grupo">Santo Terço</span>
                    <h3>${itemSelecionado.titulo}</h3>
                    <p class="dias_semana_grupo">📅 ${itemSelecionado.dias}</p>
                </div>

                <div class="bloco_oracoes_iniciais">
                    <h4>Orações Iniciais</h4>
                    <ul class="lista_misterio_iniciais">${oracoesHTML}</ul>
                </div>

                <div class="bloco_contemplacoes">
                    <h4>Contemplação dos Mistérios</h4>
                    <ul class="lista_misterios_links">${linksMisteriosHTML}</ul>
                </div>

                <br>
                <a href="#" class="btn_navegacao btn_voltar">← Página Inicial</a>
            </div>
        </div>
    `;
}
    // CASO B: Mistério Individual (ex: #gozosos-1, #dolorosos-5)
    else if (itemSelecionado.oracoes) {
        const imagemHTML = itemSelecionado.imagem
            ? `<img src="${itemSelecionado.imagem}" alt="${itemSelecionado.titulo}" class="images_misterio">`
            : '';

        const oracoesHTML = itemSelecionado.oracoes
            .map(oracao => {
                if (oracao.toLowerCase().includes("ave maria")) {
                    return `
                        <li class="item_ave_maria_contador">
                            <p class="texto_avemaria">Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora de nossa morte. Amém.</p>
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

        const [grupo, numeroString] = chaveMisterio.split('-');
        const numeroAtual = parseInt(numeroString, 10);

        let linkAnteriorHTML = '';
        if (numeroAtual > 1) {
            const anteriorSlug = `${grupo}-${numeroAtual - 1}`;
            linkAnteriorHTML = `<a href="#${anteriorSlug}" class="btn_navegacao btn_voltar">← ${numeroAtual - 1}º Mistério</a>`;
        } else {
            linkAnteriorHTML = `<a href="#${grupo}" class="btn_navegacao btn_voltar">← Menu dos ${grupo.toUpperCase()}</a>`;
        }

        let linkProximoHTML = '';
        if (numeroAtual < 5) {
            const proximoSlug = `${grupo}-${numeroAtual + 1}`;
            linkProximoHTML = `<a href="#${proximoSlug}" class="btn_navegacao btn_proximo">Próximo Mistério →</a>`;
        } else {
            linkProximoHTML = `<a href="#${grupo}" class="btn_navegacao btn_proximo">Concluir Mistérios ✓</a>`;
        }

        const ehUltimoMisterio = numeroAtual === 5;
        const oracoesFinaisHTML = ehUltimoMisterio ? `
            <hr class="divisor_finais">
            <div class="secao_oracoes_finais">
                <h4>Orações Finais do Terço</h4>
                <ul class="lista_misterio">
                    <li class="card_oracao_final">
                        <p><strong>Salve Rainha</strong></p>
                        <p>Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos os degredados filhos de Eva. A vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia pois, advogada nossa, esses vossos olhos misericordiosos a nós voltai, e depois deste desterro mostrai-nos Jesus, bendito fruto do vosso ventre. Ó clemente, ó piedosa, ó doce sempre Virgem Maria.</p>
                        <p>Rogai por nós, Santa Mãe de Deus, para que sejamos dignos das promessas de Cristo. Amém.</p>
                    </li>
                    <li class="card_oracao_final sinal_cruz_final">
                        <p><strong>Sinal da Cruz Final ✝</strong></p>
                        <p>Em nome do Pai, e do Filho, e do Espírito Santo. Amém.</p>
                    </li>
                </ul>
            </div>
        ` : '';

        const painelNavegacaoHTML = `
            <div class="painel_navegacao">
                ${linkAnteriorHTML}
                <span class="indicador_progresso">${numeroAtual} de 5</span>
                ${linkProximoHTML}
            </div>
        `;

        containerMisterio.innerHTML = `
            ${painelNavegacaoHTML}

            <div class="hero_misterio_banner" id="imagem_topo_misterio">
                ${imagemHTML}
                <div class="overlay_hero_texto">
                    <span class="badge_grupo_misterio">${grupo.toUpperCase()}</span>
                    <h3>${itemSelecionado.titulo}</h3>
                    <p class="subtitulo_misterio_banner">${itemSelecionado.subtitulo}</p>
                </div>
            </div>

            <h4>Orações do Mistério</h4>
            <ul class="lista_misterio">${oracoesHTML}</ul>

            ${oracoesFinaisHTML}

            ${painelNavegacaoHTML}
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

// 5. EVENT LISTENERS
window.addEventListener("DOMContentLoaded", iniciarSite);
window.addEventListener("hashchange", roteador);
// Desativa a restauração automática de rolagem nativa dos navegadores
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

const containerInicial = document.getElementById('texto_oracao_inicial');
const containerMisterio = document.getElementById('conteudo_misterio');
let dadosMisterios = null;

// Objeto para persistir a contagem da dezena enquanto o usuário navega
const progressoDezenas = {};

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
                ? `<div class="container_imagem_historia">
                    <img src="${historia.imagem}" alt="${historia.titulo}" class="imagem_historia_destaque">
                    <span class="legenda_imagem_historia">Nossa Senhora entregando o Santo Rosário a São Domingos de Gusmão</span>
                   </div>`
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

// 2. ATUALIZA ESTADO ATIVO DO MENU
function atualizarMenuAtivo(paginaAtual) {
    const links = document.querySelectorAll('.nav_item a');
    links.forEach(link => {
        const misterioGrupo = link.getAttribute('data-misterio');
        if (paginaAtual && paginaAtual.startsWith(misterioGrupo)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// 3. ROLAGEM ROBUSTA PARA MOBILE E DESKTOP
function rolarParaTopoDoConteudo() {
    // Timeout duplo garante que o layout do smartphone estabilizou antes de rolar
    setTimeout(() => {
        const elementoAlvo = document.getElementById('imagem_topo_misterio') || document.querySelector('#conteudo_misterio h3') || document.querySelector('main');

        if (elementoAlvo) {
            elementoAlvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, 50);
}

function rolarParaTopoAbsoluto() {
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, 50);
}

// 4. ROTEADOR NAVEGACIONAL (SPA)
function roteador() {
    const paginaAtual = window.location.hash.replace('#', '');
    atualizarMenuAtivo(paginaAtual);

    if (!paginaAtual || paginaAtual === 'inicio') {
        containerInicial.style.display = "block";
        containerMisterio.style.display = "none";
        document.title = "Terço Online - História do Terço";

        rolarParaTopoAbsoluto();
    } else {
        containerInicial.style.display = "none";
        containerMisterio.style.display = "block";

        containerMisterio.classList.remove('animar_entrada');
        void containerMisterio.offsetWidth; // Força reflow no navegador
        containerMisterio.classList.add('animar_entrada');

        exibirMisterio(paginaAtual);
        rolarParaTopoDoConteudo();
    }
}

// 5. RENDERIZADOR DE CONTEÚDO
function exibirMisterio(chaveMisterio) {
    if (!dadosMisterios) return;

    const itemSelecionado = dadosMisterios[chaveMisterio];

    if (!itemSelecionado) {
        containerMisterio.innerHTML = `<p class="mensagem_ajuda">Conteúdo não encontrado.</p>`;
        return;
    }

    document.title = `Terço Online - ${itemSelecionado.titulo}`;

    // CASO A: Grupo Principal (#gozosos, #dolorosos, #gloriosos)
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

        let contagem = progressoDezenas[chaveMisterio] || 0;

        let bolinhasDezenaHTML = '';
        for (let i = 1; i <= 10; i++) {
            const ehRezada = i <= contagem ? 'rezada' : '';
            bolinhasDezenaHTML += `<span class="conta_bolinha_dezena ${ehRezada}" id="bolinha_conta_${i}"></span>`;
        }

        const oracoesHTML = itemSelecionado.oracoes
            .map(oracao => {
                if (oracao.toLowerCase().includes("ave maria")) {
                    const textoBotao = contagem === 10 ? "Concluído ✓" : "+1 Ave-Maria";
                    const estiloBotao = contagem === 10 ? 'style="background-color: #4CAF50; color: white;" disabled' : '';

                    return `
                        <li class="item_ave_maria_contador">
                            <p class="texto_avemaria">Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulheres e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós pecadores, agora e na hora de nossa morte. Amém.</p>
                            <div class="painel_contador_inline">
                                <div class="topo_contador">
                                    <span class="placar_avemaria">Rezadas: <strong id="valor_contador">${contagem}</strong> / 10</span>
                                    <button id="btn_contar_avemaria" class="btn_contar_inline" ${estiloBotao}>${textoBotao}</button>
                                </div>
                                <div class="regua_contas_terco">
                                    ${bolinhasDezenaHTML}
                                </div>
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

        const btnContar = document.getElementById('btn_contar_avemaria');
        const visorContador = document.getElementById('valor_contador');

        if (btnContar && visorContador) {
            btnContar.addEventListener('click', () => {
                if (contagem < 10) {
                    contagem++;
                    progressoDezenas[chaveMisterio] = contagem;
                    visorContador.innerText = contagem;

                    const contaAtual = document.getElementById(`bolinha_conta_${contagem}`);
                    if (contaAtual) {
                        contaAtual.classList.add('rezada');
                    }

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

// 6. INTERCEPTADOR GLOBAL DE CLIQUES (Garante comportamento idêntico em celulares e notebooks)
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
        e.preventDefault(); // Impede o salto bruto padrão do mobile
        const destinoHash = link.getAttribute('href');

        if (window.location.hash !== destinoHash) {
            window.location.hash = destinoHash; // Aciona o hashchange de forma controlada
        } else {
            roteador(); // Força a rota caso já estivesse no mesmo hash
        }
    }
});

// 7. EVENT LISTENERS
window.addEventListener("DOMContentLoaded", iniciarSite);
window.addEventListener("hashchange", roteador);
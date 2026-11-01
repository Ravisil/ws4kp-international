# WeatherStar 4000+ (Internacional) — versão em português do Brasil

> Esta é a tradução para português (pt-BR) do [`ws4kp-international`](https://github.com/mwood77/ws4kp-international). O README original, em inglês, está em [README.md](./README.md).

Este projeto é um fork do [`ws4kp`](https://github.com/netbymatt/ws4kp), de [@netbymatt](https://github.com/netbymatt), reescrito para usar a [API agregada do Open-Meteo](https://open-meteo.com/en/docs). Por isso funciona para qualquer lugar do mundo, não só para os EUA.

## Sobre

O projeto recria o visual dos anos 90 do The Weather Channel, de forma moderna, com o mínimo de configuração. Não é uma emulação perfeita do hardware WeatherStar 4000 — se você quer algo mais fiel, veja o [WS4000 Simulator](http://www.taiganet.com/). Algumas telas foram alteradas porque hoje há mais (ou menos) informações disponíveis do que nos anos 90.

## Como rodar

### Com Docker (site em português)

A imagem publicada pelo projeto original (`ghcr.io/mwood77/ws4kp-international`) **continua em inglês**. Para ter o site em português, construa a imagem a partir deste repositório:

```bash
git clone <URL-DESTE-REPOSITORIO>
cd ws4kp-international
docker build -t ws4kp-ptbr .
docker run -p 8080:8080 ws4kp-ptbr
```

Depois abra <http://localhost:8080/> no navegador. Para usar outra porta, por exemplo a 3000: `docker run -p 3000:8080 ws4kp-ptbr`.

### Com Node.js (sem Docker)

```bash
npm ci
npm run start
```

Requer Node.js 18 ou superior. O site abre em <http://localhost:8080/>.

## O que foi traduzido

- Toda a interface (`views/`): títulos das telas, rótulos, botões, menus, configurações e rodapé.
- As condições do tempo (códigos WMO do Open-Meteo), nomes dos dias da semana, fases da lua e datas, no formato brasileiro.
- Os ventos usam só 8 siglas, fáceis de aprender: **N** (norte), **NE** (nordeste), **L** (leste), **SE** (sudeste), **S** (sul), **SO** (sudoeste), **O** (oeste) e **NO** (noroeste). O texto da Previsão Local escreve o nome por extenso, e a página traz uma legenda.
- O texto da **Previsão Local**, os avisos e condições da **Previsão Marítima**, as unidades (nós, pés, metros) e o texto rolante das condições atuais.
- A busca de cidades do Open-Meteo agora pede os nomes em português (`language=pt`).
- As fontes pixeladas do WeatherStar não tinham os caracteres acentuados desenhados (ã, ç, é…); eles foram desenhados com o script [`tools/add-font-accents.py`](./tools/add-font-accents.py).

### O que continua em inglês

- O nome do produto, **WeatherStar 4000+**.
- As sugestões da busca de endereço (vêm do serviço de geocodificação da Esri) e as categorias enviadas a ele.
- Nomes de músicas do Webamp e a documentação histórica de versões no `README.md`.
- Os rótulos "Star", "Fork", "Issue" e "Sponsor", que são do botão do GitHub.
- Alguns gráficos de fundo (imagens) que possam ter texto embutido.

## Telas disponíveis

| Tela | O que mostra |
| --- | --- |
| Condições Atuais | Temperatura, vento, umidade, orvalho, teto, visibilidade, pressão, nuvens e índice UV |
| Previsão Horária / Gráfico Horário | As próximas horas, em lista e em gráfico |
| Previsão Local | Texto da previsão para os próximos dias (dia e noite) |
| Previsão Estendida | Mínima e máxima dos próximos dias |
| Almanaque | Nascer e pôr do sol e fases da lua |
| Radar Local | Chuva nas últimas horas (Rainviewer) |
| Previsão Marítima | Vento, ondas e avisos para navegação |
| Qualidade do Ar | Índice de qualidade do ar (IQA) |
| Estação Pessoal | Dados da sua própria estação meteorológica (protocolo Weather Underground, em `/v1/pws`) |

> As telas Alertas, Últimas Observações, Previsão de Viagem e Previsão Regional dependem de dados dos EUA (NOAA) e não funcionam nesta versão internacional.

## Arquitetura

O projeto segue um modelo parecido com MVC: as visões ficam em `views/` e a lógica em `server/scripts/modules/`.

- Ponto de entrada: `server/scripts/index.mjs`
- Dados da previsão (Open-Meteo): `server/scripts/modules/utils/weather.mjs`
- Configurações globais: `server/scripts/modules/settings.mjs`
- **Idioma:** `server/scripts/modules/utils/i18n.mjs` (rosa dos ventos, nomes de dias e condições do mar) e as tabelas de condições do tempo em `weather.mjs`.

Dentro do código, as chaves internas (por exemplo, o texto em inglês usado para escolher o ícone de uma condição) continuam em inglês de propósito. Só o texto mostrado na tela é traduzido. Se você adicionar uma condição nova, preencha `text` (chave interna), `label` (texto completo) e `short` (versão curta) em `weatherConditions`.

## Compartilhar um link permanente

Clique em "Copiar link permanente" perto do fim da página. O link guarda o local e as telas escolhidas.

## Modo quiosque

Marque "Modo quiosque" nas configurações. Não há como sair dele (só atualizando a página ou fechando o navegador). Também é possível entrar no modo quiosque por link permanente, adicionando `&kiosk=true` ao final.

## Relatar problemas

Encontrou um erro, ou tem uma sugestão? Abra uma issue em <https://github.com/mwood77/ws4kp-international/issues>.

## Aviso

Este site **NÃO deve ser usado em situações de risco de vida** relacionadas ao tempo, nem como fonte para informar o público sobre elas. A Internet é uma rede instável, sujeita a quedas de servidores e de conexão, e não é adequada para esse tipo de uso crítico. Consulte sempre a Defesa Civil e o serviço meteorológico oficial da sua região. Os autores não se responsabilizam por lesões, mortes ou danos materiais decorrentes do descumprimento deste aviso.

A tecnologia WeatherSTAR 4000 pertence ao The Weather Channel. Este site é um trabalho gratuito, sem fins lucrativos, feito por fãs. Os gráficos de fundo foram criados do zero; os ícones, por Charles Abel, Nick Smith e Malek Masoud; e as fontes, originalmente por Nick Smith ([TWC Classics](http://twcclassics.com/downloads/fonts.html)).

## Créditos

Baseado no trabalho de [Mike Battaglia](https://github.com/vbguyny/ws4kp) e [@netbymatt](https://github.com/netbymatt). A versão internacional foi criada por [@mwood77](https://github.com/mwood77).

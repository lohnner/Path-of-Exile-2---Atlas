# Atlas de Wraeclast — Path of Exile 2

Aplicativo local com uma página inicial e um catálogo pesquisável de itens. A wiki mostra bases, itens únicos, moedas e gemas; ao abrir uma base, exibe propriedades e modificadores compatíveis segundo as tags e os pesos de geração dos dados exportados.

O catálogo prioriza os nomes em português, oferece filtro por tipo (por exemplo, arcos), mostra imagens dos itens e revela o nome em inglês ao passar o mouse. Nomes e atributos de itens únicos vêm do catálogo PT da comunidade; onde não houver tradução disponível, o nome original é mantido. A lista de modificadores possíveis continua ligada à exportação de dados do jogo.

## Instalar

1. Instale o [Node.js](https://nodejs.org/) (versão LTS).
2. Nesta página do GitHub, clique em **Code → Download ZIP** e extraia a pasta.

## Abrir

1. Execute `Iniciar Atlas.bat`.
2. O navegador abrirá em `http://127.0.0.1:4173`.
3. Use **Sincronizar** para baixar os dados mais recentes disponíveis.
4. Para fechar, encerre a janela do servidor.

O inicializador procura primeiro o runtime Node.js incluído no cache do Codex e depois tenta encontrar uma instalação normal pelo `PATH`. O servidor local escuta apenas em `127.0.0.1`.

## De onde vêm os dados

- Bases, modificadores, gemas e nomes de únicos: exportação pública do projeto comunitário [RePoE](https://repoe-fork.github.io/poe2/), derivada de dados extraídos dos arquivos do jogo.
- Atributos dos únicos: API Cargo da [wiki comunitária PoE2](https://www.poe2wiki.net/).
- Nomes, fichas localizadas e imagens: [PoE2DB em português](https://poe2db.tw/pt/Items).
- A instalação local é detectada pela pasta `Bundles2`. Como os dados do cliente ficam empacotados ali, o app usa os exports públicos para o catálogo e não descompacta nem modifica os arquivos do jogo.

A sincronização salva uma cópia local em `data/`; a data de publicação da exportação e a versão reportada pela fonte aparecem na página inicial. Os artigos da wiki comunitária podem estar incompletos ou atrasados em relação a patches recentes.

## Arquivos

- `server.js`: servidor local e sincronização dos dados.
- `public/`: interface Início / Wiki.
- `data/`: cache local dos dados sincronizados.
- `settings.json`: caminho da instalação detectada, quando definido manualmente.

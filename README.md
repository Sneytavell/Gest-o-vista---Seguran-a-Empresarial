# Gestão à Vista — Segurança Empresarial

Portal da Segurança Empresarial da Albras que reúne, em um só lugar, os painéis de Power BI da área.

## O que tem

- Menu lateral com categorias recolhíveis (Patrimonial, Emergência, Equipamentos, Treinamentos, Gestão) e seus painéis.
- Relatório do Power BI aberto dentro do portal, com botões de tela cheia, recarregar e abrir em nova aba.
- Busca, favoritos, recentes e barra de "Mais acessados" (salvos no navegador de cada pessoa).
- Tema claro e escuro.

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | O portal inteiro (página, estilos, código e lista de painéis). |
| `vercel.json` | Configuração da Vercel (URLs limpas e página fora dos buscadores). |

## Como alterar os painéis

A lista de painéis fica no bloco `<script id="dados" type="application/json">` do `index.html`.
Cada painel tem `titulo`, `desc`, `cat` (categoria), `link` (link do Power BI) e, opcionalmente, `img` (miniatura).

## Publicação

O repositório está pronto para a Vercel: em vercel.com, **Add New → Project**, escolha este repositório e clique em **Deploy**.
Cada alteração enviada para a branch `main` atualiza o mesmo link automaticamente.

## Acesso

O site não tem login próprio. Os dados ficam protegidos pelo login da Microsoft no Power BI:
só abre o relatório quem tem acesso a ele.

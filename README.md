# Gestão à Vista — Segurança Empresarial

Portal da Segurança Empresarial da Albras que reúne os painéis de Power BI da área, com login e controle de acesso.

## Perfis de acesso

| Perfil | O que pode fazer |
|---|---|
| **Administrador** | Tudo: cria, edita e exclui painéis, cadastra usuários, define perfis, ativa e desativa acessos |
| **Editor** | Cria e edita painéis e categorias |
| **Visualizador** | Só vê e abre os painéis |
| **Visitante** | Sem cadastro: botão "Entrar como visitante", só visualização (o administrador liga ou desliga) |

Sem login, nada aparece. As permissões são conferidas pelo banco (regras em `firestore.rules`), não só pela tela.

## Estrutura

| Caminho | Função |
|---|---|
| `src/telas.html` | Telas (login, portal, perfil, formulários) |
| `src/estilo.css` | Visual |
| `src/app.js` | Código do portal, login e gestão de usuários |
| `dados/logo.txt` | Logo da Albras |
| `dados/semente.json` | Lista inicial de painéis (importada uma vez pelo administrador) |
| `firebase-config.js` | Dados do projeto Firebase (preencher) |
| `firestore.rules` | Regras de acesso do banco |
| `build.py` | Monta `dist/index.html` |
| `dist/` | Site publicado na Vercel |

## Configuração (uma vez)

1. **Firebase** (console.firebase.google.com) — use um projeto **só para este portal**:
   - *Authentication → Método de login →* ative **E-mail/senha** e **Anônimo** (para o acesso de visitante).
   - *Firestore Database →* crie o banco e, em **Regras**, cole o conteúdo de `firestore.rules` e publique.
   - *Configurações do projeto → Seus apps →* crie um **App da Web** e copie a configuração para `firebase-config.js`.
   - *Authentication → Configurações → Domínios autorizados →* adicione o domínio da Vercel (ex.: `gestao-a-vista.vercel.app`).
2. Rode `python build.py`, faça commit e push. A Vercel publica a pasta `dist`.
3. Abra o site e faça a **Primeira configuração** (cria o administrador). Depois, clique em **Importar painéis atuais**.

## Alterações

Edite os arquivos em `src/`, rode `python build.py`, registre em `docs/historico-de-etapas.md`, faça commit e push na `main`.
Painéis e usuários do dia a dia são alterados pelo próprio portal, sem mexer no código.

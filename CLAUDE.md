# Instruções do projeto

- Código-fonte: `src/telas.html`, `src/estilo.css`, `src/app.js`; logo em `dados/logo.txt`; lista inicial de painéis em `dados/semente.json`.
- Gerar o site: `python build.py` → `dist/index.html` (publicado na Vercel; a Vercel copia `firebase-config.js` para `dist/`).
- Banco: Firebase (Auth e-mail/senha + Firestore). Regras de acesso em `firestore.rules`: perfis `admin`, `editor`, `visualizador`; usuário com `ativo: false` perde o acesso.
- A cada alteração: atualizar `docs/historico-de-etapas.md`, gerar o `dist`, fazer commit e push na `main`.
- Textos da interface em português do Brasil; números com vírgula decimal.
- Painéis e usuários do dia a dia ficam no banco, não no repositório.

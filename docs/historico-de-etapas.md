# Histórico de etapas

## 29/10/2026
- Versão inicial do portal (cards, menu lateral por categoria, relatório do Power BI dentro da página, favoritos, recentes, mais acessados, tema claro/escuro).
- Login com e-mail e senha (Firebase) e três perfis: Administrador, Editor e Visualizador.
- Área "Usuários e acessos" para o administrador: criar usuário, definir perfil, desativar, enviar redefinição de senha.
- Painéis passam a ficar no banco: o que o administrador ou editor muda aparece na hora para todos.
- Regras do banco (`firestore.rules`) garantem as permissões no servidor.
- Banco ligado ao projeto Firebase `gestao-a-vista-c541f` (`firebase-config.js`).

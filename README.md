# Shelf

Shelf é um aplicativo web simples para organizar leituras.

A ideia é permitir que uma pessoa cadastre livros e acompanhe o status de cada um: quero ler, lendo ou lido. O projeto não tenta ser uma rede social e não tem login na primeira versão.

## Integrantes

- Barbara Souza: backend e product owner
- Luiza Gomes: frontend
- Leonardo Shiratsu: qualidade

## Funcionalidades do MVP

- Cadastrar livro
- Listar livros cadastrados
- Editar livro
- Excluir livro
- Alterar status de leitura
- Filtrar por status
- Registrar gênero, datas e nota de 1 a 5

## Tecnologias

- Frontend: HTML, CSS e JavaScript
- Backend/API: Node.js em função serverless da Vercel
- Banco: Supabase PostgreSQL
- Versionamento: GitHub
- Deploy: Vercel
- Testes: Node.js test runner

## Como rodar localmente

1. Copie `.env.example` para `.env`.
2. Preencha `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
3. No Supabase, execute o arquivo `database/schema.sql`.
4. Rode:

```bash
npm start
```

5. Abra `http://localhost:3000`.

## Como rodar os testes

```bash
npm test
```

Os testes cobrem validação de dados, repositório em memória e fluxo principal do sistema.

## Como fazer o deploy

1. Subir este projeto para um repositório no GitHub.
2. Importar o repositório na Vercel.
3. Criar as variáveis de ambiente na Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Fazer deploy da branch principal.
5. Conferir se a URL pública abre o sistema e salva livros no Supabase.

## Branch principal

A branch principal deve ser protegida no GitHub:

- exigir Pull Request antes do merge;
- exigir pelo menos uma aprovação;
- exigir checks de CI passando;
- bloquear push direto na main.

## Validação com cliente real

Para a entrega, uma pessoa que não participou do desenvolvimento deve usar o sistema. A tarefa sugerida é:

1. cadastrar um livro;
2. alterar o status;
3. consultar a estante;
4. excluir ou editar um livro.

Gravar um vídeo curto do uso e anotar uma impressão final da pessoa.

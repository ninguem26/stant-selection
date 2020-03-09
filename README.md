# stant-selection

## Dependências
- axios@0.19.2
- express@4.17.1
- express-fileupload@1.1.6
- mysql@2.18.1
- nodemon@2.0.2
- Node.js@10.19.0
- npm@6.13.0

## Instalando e executando

### Instalando dependências
Para instalar as dependências basta executar o comando `npm install`.

### Banco de dados
Para o projeto funcionar é necessário criar um banco de dados MySQL. Acesse um cliente MySQL e execute `CREATE DATABASE stant;`.

Para acessar o banco, edite o arquivo `database.js` na raíz do projeto com as credenciais corretas.

### Executando o projeto
Para executar o projeto, acesse o diretório raíz e execute o comando `node app.js`. Este comando vai iniciar a API Rest na porta `3000` do `localhost`.

O arquivo `test.js` já possui uma implementação do acesso à API. Para executar, abra um novo terminal e execute o comando `node -e 'require("./test").postTracks()'` para enviar uma requisição POST ou o comando `node -e 'require("./test").getTracks()'` para enviar uma requisição GET.

## API Rest
A API Rest possui duas rotas:
- GET /tracks
- POST /tracks

A resposta de ambas as rotas é um JSON. O formato da resposta pode ser conferido no arquivo `response-example.json`.
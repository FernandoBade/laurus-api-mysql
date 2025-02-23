#!/bin/bash
echo "Iniciando o deploy da aplicação..."

cd /home/u657600000/domains/bade.digital/public_html/laurus-api

# Ativar o NVM antes de executar comandos do Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20.15.1

# Instalar dependências
npm install

# Rodar Prisma especificando o caminho correto do schema
npx prisma migrate deploy --schema=src/prisma/schema.prisma
npx prisma generate --schema=src/prisma/schema.prisma

# Build do projeto
npm run build

echo "Deploy concluído com sucesso!"

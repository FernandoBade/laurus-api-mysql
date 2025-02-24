// commons/db.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_URL,
    user: process.env.DB_USUARIO,
    password: process.env.DB_SENHA,
    database: process.env.DB_NOME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});


/**
 * Executa uma query SQL de forma encapsulada.
 * @param {string} query - A query SQL.
 * @param {Array<any>} [params=[]] - Os parâmetros da query.
 * @returns {Promise<any>} - Resultado da execução.
 */
export async function executarQuery(query: string, params: any[] = []): Promise<any> {
    const conexao = await db.getConnection();
    try {
        const [resultado] = await conexao.execute(query, params);
        return resultado;
    } finally {
        conexao.release();
    }
}

interface ColunaEsperada {
  nome: string;
  definicao: string;
}

async function atualizarTabela(tabela: string, colunasEsperadas: ColunaEsperada[]) {
  try {
    const colunasAtuais: any[] = await executarQuery(`SHOW COLUMNS FROM ${tabela}`);
    const nomesColunasAtuais = colunasAtuais.map(c => c.Field);

    for (const coluna of colunasEsperadas) {
      if (!nomesColunasAtuais.includes(coluna.nome)) {
        const alterQuery = `ALTER TABLE ${tabela} ADD COLUMN ${coluna.nome} ${coluna.definicao}`;
        await executarQuery(alterQuery);
        console.log(`Coluna ${coluna.nome} adicionada à tabela ${tabela}.`);
      }
    }
  } catch (erro) {
    console.error(`Erro ao atualizar a tabela ${tabela}:`, erro);
    throw erro;
  }
}

export async function criarTabelas() {
  const usuarioColunas: ColunaEsperada[] = [
    { nome: 'id', definicao: 'INT AUTO_INCREMENT PRIMARY KEY' },
    { nome: 'nome', definicao: 'VARCHAR(255) NOT NULL' },
    { nome: 'sobrenome', definicao: 'VARCHAR(255) NOT NULL' },
    { nome: 'email', definicao: 'VARCHAR(255) NOT NULL UNIQUE' },
    { nome: 'telefone', definicao: 'VARCHAR(255)' },
    { nome: 'senha', definicao: 'VARCHAR(255) NOT NULL' },
    { nome: 'dataNascimento', definicao: 'DATETIME' },
    { nome: 'ativo', definicao: 'BOOLEAN NOT NULL DEFAULT TRUE' },
    { nome: 'dataCadastro', definicao: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP' },
    { nome: 'aparencia', definicao: 'VARCHAR(255)' },
    { nome: 'idioma', definicao: 'VARCHAR(255)' },
    { nome: 'moeda', definicao: 'VARCHAR(255)' },
    { nome: 'formatoData', definicao: 'VARCHAR(255)' }
  ];

  const logColunas: ColunaEsperada[] = [
    { nome: 'id', definicao: 'INT AUTO_INCREMENT PRIMARY KEY' },
    { nome: 'tipo', definicao: 'VARCHAR(255) NOT NULL' },
    { nome: 'operacao', definicao: 'VARCHAR(255)' },
    { nome: 'categoria', definicao: 'VARCHAR(255)' },
    { nome: 'detalhe', definicao: 'TEXT NOT NULL' },
    { nome: 'usuarioId', definicao: 'INT' },
    { nome: 'timestamp', definicao: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP' }
  ];

  const contaColunas: ColunaEsperada[] = [
    { nome: 'id', definicao: 'INT AUTO_INCREMENT PRIMARY KEY' },
    { nome: 'nome', definicao: 'VARCHAR(255) NOT NULL' },
    { nome: 'banco', definicao: 'VARCHAR(255) NOT NULL' },
    { nome: 'tipo', definicao: 'VARCHAR(255) NOT NULL' },
    { nome: 'usuarioId', definicao: 'INT NOT NULL' }
  ];

  const checkUsuario = "SHOW TABLES LIKE 'Usuario'";
  const checkLog = "SHOW TABLES LIKE 'Log'";
  const checkConta = "SHOW TABLES LIKE 'Conta'";

  try {
    const usuarioResult: any = await executarQuery(checkUsuario);
    if (usuarioResult.length === 0) {
      const usuarioTabelaQuery = `
        CREATE TABLE Usuario (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          sobrenome VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          telefone VARCHAR(255),
          senha VARCHAR(255) NOT NULL,
          dataNascimento DATETIME,
          ativo BOOLEAN NOT NULL DEFAULT TRUE,
          dataCadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          aparencia VARCHAR(255),
          idioma VARCHAR(255),
          moeda VARCHAR(255),
          formatoData VARCHAR(255)
        );
      `;
      await executarQuery(usuarioTabelaQuery);
      console.log("Tabela Usuario criada.");
    } else {
      console.log("Tabela Usuario já existe. Colunas atualizadas");
      await atualizarTabela('Usuario', usuarioColunas);
    }

    const logResult: any = await executarQuery(checkLog);
    if (logResult.length === 0) {
      const logTabelaQuery = `
        CREATE TABLE Log (
          id INT AUTO_INCREMENT PRIMARY KEY,
          tipo VARCHAR(255) NOT NULL,
          operacao VARCHAR(255),
          categoria VARCHAR(255),
          detalhe TEXT NOT NULL,
          usuarioId INT,
          timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_log_usuario FOREIGN KEY (usuarioId) REFERENCES Usuario(id) ON DELETE SET NULL
        );
      `;
      await executarQuery(logTabelaQuery);
      console.log("Tabela Log criada.");
    } else {
      console.log("Tabela Log já existe. Colunas atualizadas");
      await atualizarTabela('Log', logColunas);
      }

      const contaResult: any = await executarQuery(checkConta);

    if (contaResult.length === 0) {
      const contaTabelaQuery = `
        CREATE TABLE Conta (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(255) NOT NULL,
          banco VARCHAR(255) NOT NULL,
          tipo VARCHAR(255) NOT NULL,
          usuarioId INT NOT NULL,
          CONSTRAINT fk_conta_usuario FOREIGN KEY (usuarioId) REFERENCES Usuario(id)
        );
      `;
        console.log("Tabela  conta criada");
        await executarQuery(contaTabelaQuery);

    } else {
        console.log("Tabela Log já existe. Colunas atualizadas");

      await atualizarTabela('Conta', contaColunas);
    }
  } catch (erro) {
    console.error("Erro ao criar/atualizar tabelas:", erro);
    throw erro;
  }
}

//criarTabelas();

export default db;



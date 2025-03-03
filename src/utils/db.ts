import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { registrarLog } from './commons';
import { CategoriasDeLog, Operacoes, TiposDeLog } from './enums';

dotenv.config();

const bd = mysql.createPool({
    host: process.env.BD_URL,
    user: process.env.BD_USUARIO,
    password: process.env.BD_SENHA,
    database: process.env.BD_NOME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default bd;

/**
 * Executa uma query SQL de forma segura.
 */
export async function executarQuery(query: string, parametros: any[] = []): Promise<any> {
    const conexao = await bd.getConnection();
    try {
        const [resultado] = await conexao.execute(query, parametros);
        return resultado;
    } catch (erro) {
        throw erro;
    } finally {
        if (conexao) {
            conexao.release();
        }
    }
}


/**
 * Verifica se uma tabela existe no banco.
 */
async function tabelaExiste(nome: string): Promise<boolean> {
    const resultado: any = await executarQuery(`SHOW TABLES LIKE '${nome}'`);
    return resultado.length > 0;
}

/**
 * Atualiza colunas da tabela se necessário.
 */
async function atualizarTabela(tabela: string, colunas: { nome: string; definicao: string }[]) {
    try {
        const colunasAtuais: any[] = await executarQuery(`SHOW COLUMNS FROM ${tabela}`);
        const chavesPrimarias: any[] = await executarQuery(`SHOW KEYS FROM ${tabela} WHERE Key_name = 'PRIMARY'`);
        const chavesPrimariasExistentes = new Set(chavesPrimarias.map(c => c.Column_name));

        let alteracoes: any[] = [];

        for (const { nome, definicao } of colunas) {
            const colunaAtual = colunasAtuais.find(c => c.Field === nome);

            if (!colunaAtual) {
                await executarQuery(`ALTER TABLE ${tabela} ADD COLUMN ${nome} ${definicao}`);
                alteracoes.push({ coluna: nome, acao: "adicionada" });
            } else {
                if (definicao.includes("PRIMARY KEY") && chavesPrimariasExistentes.has(nome)) {
                    continue;
                }

                const tipoAtual = colunaAtual.Type.toUpperCase()
                    .replace(/INT\(\d+\)/, "INT")
                    .replace("TINYINT", "BOOLEAN");

                const tipoNovo = definicao.split(" ")[0].toUpperCase()
                    .replace(/INT\(\d+\)/, "INT")
                    .replace("BOOLEAN", "BOOLEAN");

                if (tipoAtual !== tipoNovo) {
                    await executarQuery(`ALTER TABLE ${tabela} MODIFY COLUMN ${nome} ${definicao}`);
                    alteracoes.push({ coluna: nome, acao: "tipo alterado", antigoTipo: tipoAtual, novoTipo: tipoNovo });
                }

                const defaultAtual = colunaAtual.Default;
                const defaultNovo = definicao.match(/DEFAULT\s+'(.+?)'/)?.[1];

                if (defaultNovo && defaultAtual !== defaultNovo) {
                    await executarQuery(`ALTER TABLE ${tabela} MODIFY COLUMN ${nome} ${definicao}`);
                    alteracoes.push({ coluna: nome, acao: "default alterado", antigoDefault: defaultAtual, novoDefault: defaultNovo });
                }
            }
        }

        if (alteracoes.length > 0) {
            await registrarLog(TiposDeLog.SUCESSO, Operacoes.ATUALIZACAO, CategoriasDeLog.BancoDeDados,
                { tabela, alteracoes }, undefined);
        }
    } catch (erro: any) {
        await registrarLog(TiposDeLog.ERRO, Operacoes.ATUALIZACAO, CategoriasDeLog.BancoDeDados,
            { tabela, erro: erro.message }, undefined);
        throw erro;
    }
}


/**
 *  Cria tabelas caso não existam ou atualiza as existentes. Para novas tabelas, adicionar abaixo seguindo o mesmo padrão.
 */
export async function criarTabelas() {
    const tabelas = [
        {
            nome: "Usuario",
            colunas: [
                { nome: 'id', definicao: 'INT AUTO_INCREMENT PRIMARY KEY' },
                { nome: 'nome', definicao: 'VARCHAR(255) NOT NULL' },
                { nome: 'sobrenome', definicao: 'VARCHAR(255) NOT NULL' },
                { nome: 'email', definicao: 'VARCHAR(255) NOT NULL UNIQUE' },
                { nome: 'telefone', definicao: 'VARCHAR(255)' },
                { nome: 'senha', definicao: 'VARCHAR(255) NOT NULL' },
                { nome: 'dataNascimento', definicao: 'DATETIME' },
                { nome: 'ativo', definicao: 'BOOLEAN NOT NULL DEFAULT TRUE' },
                { nome: 'dataCadastro', definicao: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP' },
                { nome: 'aparencia', definicao: `VARCHAR(255) NOT NULL DEFAULT 'dark'` },
                { nome: 'idioma', definicao: `VARCHAR(255) NOT NULL DEFAULT 'pt-BR'` },
                { nome: 'moeda', definicao: `VARCHAR(255) NOT NULL DEFAULT 'BRL'` },
                { nome: 'formatoData', definicao: `VARCHAR(255) NOT NULL DEFAULT 'DD/MM/AAAA'` },
            ]
        },
        {
            nome: "Log",
            colunas: [
                { nome: 'id', definicao: 'INT AUTO_INCREMENT PRIMARY KEY' },
                { nome: 'tipo', definicao: 'VARCHAR(255) NOT NULL' },
                { nome: 'operacao', definicao: 'VARCHAR(255)' },
                { nome: 'categoria', definicao: 'VARCHAR(255)' },
                { nome: 'detalhe', definicao: 'TEXT NOT NULL' },
                { nome: 'usuarioId', definicao: 'INT' },
                { nome: 'timestamp', definicao: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP' },
            ]
        },
        {
            nome: "Conta",
            colunas: [
                { nome: 'id', definicao: 'INT AUTO_INCREMENT PRIMARY KEY' },
                { nome: 'nome', definicao: 'VARCHAR(255) NOT NULL' },
                { nome: 'banco', definicao: 'VARCHAR(255) NOT NULL' },
                { nome: 'tipo', definicao: 'VARCHAR(255) NOT NULL' },
                { nome: 'usuarioId', definicao: 'INT NOT NULL' },
            ]
        }
    ];

    try {
        for (const tabela of tabelas) {
            if (await tabelaExiste(tabela.nome)) {
                await atualizarTabela(tabela.nome, tabela.colunas);
            } else {
                const colunasSQL = tabela.colunas.map(col => `${col.nome} ${col.definicao}`).join(',\n  ');
                const criarTabelaQuery = `CREATE TABLE ${tabela.nome} (\n  ${colunasSQL}\n);`;
                await executarQuery(criarTabelaQuery);
                await registrarLog(TiposDeLog.SUCESSO, Operacoes.CRIACAO, CategoriasDeLog.BancoDeDados, { tabela: tabela.nome }, undefined);
            }
        }
    } catch (erro) {
        await registrarLog(TiposDeLog.ERRO, Operacoes.ATUALIZACAO, CategoriasDeLog.BancoDeDados, JSON.stringify(erro), undefined);
        throw erro;
    }
}

// (async () => {
//     try {
//         await criarTabelas();
//     } catch (erro) {
//     }
// })();
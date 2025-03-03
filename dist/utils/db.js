"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executarQuery = executarQuery;
exports.criarTabelas = criarTabelas;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const commons_1 = require("./commons");
const enums_1 = require("./enums");
dotenv_1.default.config();
const bd = promise_1.default.createPool({
    host: process.env.BD_URL,
    user: process.env.BD_USUARIO,
    password: process.env.BD_SENHA,
    database: process.env.BD_NOME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
exports.default = bd;
/**
 * Executa uma query SQL de forma encapsulada.
 */
function executarQuery(query_1) {
    return __awaiter(this, arguments, void 0, function* (query, parametros = []) {
        const conexao = yield bd.getConnection();
        try {
            const [resultado] = yield conexao.execute(query, parametros);
            return resultado;
        }
        catch (erro) {
            console.error("Erro ao executar query:", erro);
            throw erro;
        }
        finally {
            conexao.release();
        }
    });
}
/**
 * Verifica se uma tabela existe no banco.
 */
function tabelaExiste(nome) {
    return __awaiter(this, void 0, void 0, function* () {
        const resultado = yield executarQuery(`SHOW TABLES LIKE '${nome}'`);
        return resultado.length > 0;
    });
}
/**
 * Atualiza colunas da tabela se necessário.
 */
function atualizarTabela(tabela, colunas) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const colunasAtuais = yield executarQuery(`SHOW COLUMNS FROM ${tabela}`);
            const chavesPrimarias = yield executarQuery(`SHOW KEYS FROM ${tabela} WHERE Key_name = 'PRIMARY'`);
            const chavesPrimariasExistentes = new Set(chavesPrimarias.map(c => c.Column_name));
            let alteracoes = [];
            for (const { nome, definicao } of colunas) {
                const colunaAtual = colunasAtuais.find(c => c.Field === nome);
                if (!colunaAtual) {
                    yield executarQuery(`ALTER TABLE ${tabela} ADD COLUMN ${nome} ${definicao}`);
                    alteracoes.push({ coluna: nome, acao: "adicionada" });
                }
                else {
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
                        yield executarQuery(`ALTER TABLE ${tabela} MODIFY COLUMN ${nome} ${definicao}`);
                        alteracoes.push({ coluna: nome, acao: "tipo alterado", antigoTipo: tipoAtual, novoTipo: tipoNovo });
                    }
                    const defaultAtual = colunaAtual.Default;
                    const defaultNovo = (_a = definicao.match(/DEFAULT\s+'(.+?)'/)) === null || _a === void 0 ? void 0 : _a[1];
                    if (defaultNovo && defaultAtual !== defaultNovo) {
                        yield executarQuery(`ALTER TABLE ${tabela} MODIFY COLUMN ${nome} ${definicao}`);
                        alteracoes.push({ coluna: nome, acao: "default alterado", antigoDefault: defaultAtual, novoDefault: defaultNovo });
                    }
                }
            }
            if (alteracoes.length > 0) {
                yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.SUCESSO, enums_1.Operacoes.ATUALIZACAO, enums_1.CategoriasDeLog.BancoDeDados, { tabela, alteracoes }, undefined);
            }
        }
        catch (erro) {
            yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.ERRO, enums_1.Operacoes.ATUALIZACAO, enums_1.CategoriasDeLog.BancoDeDados, { tabela, erro: erro.message }, undefined);
            throw erro;
        }
    });
}
/**
 *  Cria tabelas caso não existam ou atualiza as existentes. Para novas tabelas, adicionar abaixo seguindo o mesmo padrão.
 */
function criarTabelas() {
    return __awaiter(this, void 0, void 0, function* () {
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
                if (yield tabelaExiste(tabela.nome)) {
                    yield atualizarTabela(tabela.nome, tabela.colunas);
                    yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.SUCESSO, enums_1.Operacoes.ATUALIZACAO, enums_1.CategoriasDeLog.BancoDeDados, { tabela: tabela.nome }, undefined);
                }
                else {
                    const colunasSQL = tabela.colunas.map(col => `${col.nome} ${col.definicao}`).join(',\n  ');
                    const criarTabelaQuery = `CREATE TABLE ${tabela.nome} (\n  ${colunasSQL}\n);`;
                    yield executarQuery(criarTabelaQuery);
                    yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.SUCESSO, enums_1.Operacoes.CRIACAO, enums_1.CategoriasDeLog.BancoDeDados, { tabela: tabela.nome }, undefined);
                }
            }
        }
        catch (erro) {
            yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.ERRO, enums_1.Operacoes.ATUALIZACAO, enums_1.CategoriasDeLog.BancoDeDados, JSON.stringify(erro), undefined);
            throw erro;
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield criarTabelas();
        console.log("✅ Tabelas criadas/atualizadas com sucesso!");
    }
    catch (erro) {
        console.error("❌ Erro ao criar/atualizar tabelas:", erro);
    }
}))();

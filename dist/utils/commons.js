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
Object.defineProperty(exports, "__esModule", { value: true });
exports.executarQuery = void 0;
exports.registrarLog = registrarLog;
exports.buscarLogsPorUsuario = buscarLogsPorUsuario;
exports.responderAPI = responderAPI;
exports.formatarErrosDeValidacao = formatarErrosDeValidacao;
exports.buscarPorId = buscarPorId;
exports.salvarRegistro = salvarRegistro;
exports.atualizarRegistro = atualizarRegistro;
exports.excluirRegistro = excluirRegistro;
exports.consultarDados = consultarDados;
const enums_1 = require("./enums");
const winston_1 = require("winston");
const db_1 = require("./db");
Object.defineProperty(exports, "executarQuery", { enumerable: true, get: function () { return db_1.executarQuery; } });
const logService_1 = require("../services/logService");
//#region 🔹 Logger
const logsCustomizados = {
    levels: {
        [enums_1.TiposDeLog.ERRO]: 0,
        [enums_1.TiposDeLog.ALERTA]: 1,
        [enums_1.TiposDeLog.SUCESSO]: 2,
        [enums_1.TiposDeLog.INFO]: 3,
        [enums_1.TiposDeLog.DEBUG]: 4
    },
    colors: {
        [enums_1.TiposDeLog.ERRO]: 'red',
        [enums_1.TiposDeLog.ALERTA]: 'yellow',
        [enums_1.TiposDeLog.SUCESSO]: 'green',
        [enums_1.TiposDeLog.INFO]: 'blue',
        [enums_1.TiposDeLog.DEBUG]: 'magenta'
    }
};
(0, winston_1.addColors)(logsCustomizados.colors);
const logger = (0, winston_1.createLogger)({
    levels: logsCustomizados.levels,
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.colorize({ all: true }), winston_1.format.printf(({ timestamp, level, message }) => `[${timestamp}][${level}]${message}`)),
    transports: [
        new winston_1.transports.Console({
            level: enums_1.TiposDeLog.DEBUG,
        })
    ]
});
/**
 * Registra uma mensagem de log.
 *
 * @param tipoDeLog - Tipo de log (ERRO, ALERTA, SUCESSO, INFO, DEBUG).
 * @param operacao - Tipo de operação realizada.
 * @param detalhe - Detalhe da operação ou erro.
 * @param usuarioId - ID do usuário associado ao log (opcional).
 * @param next - Função do Express para continuar o fluxo (opcional).
 */
function registrarLog(tipoDeLog, operacao, categoria, detalhe, usuarioId, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const mensagemLog = typeof detalhe === "object" && Object.keys(detalhe).length === 0
            ? "Erro desconhecido"
            : JSON.stringify(detalhe);
        logger.log(tipoDeLog, `[${operacao}][${categoria}]: ${mensagemLog}`);
        if (tipoDeLog === enums_1.TiposDeLog.ERRO) {
            next === null || next === void 0 ? void 0 : next(new Error(mensagemLog));
        }
        if (tipoDeLog !== enums_1.TiposDeLog.DEBUG) {
            yield logService_1.LogService.registrarLog(tipoDeLog, operacao, categoria, mensagemLog, usuarioId);
        }
    });
}
/**
 * Busca logs associados a um usuário específico.
 *
 * @param usuarioId - ID do usuário cujos logs devem ser buscados.
 * @returns Uma lista de logs associados ao usuário.
 */
function buscarLogsPorUsuario(usuarioId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const logs = yield logService_1.LogService.buscarLogsPorUsuario(usuarioId);
            return logs;
        }
        catch (erro) {
            yield registrarLog(enums_1.TiposDeLog.DEBUG, enums_1.Operacoes.BUSCA, enums_1.CategoriasDeLog.LOG, JSON.stringify(erro), usuarioId);
            throw new Error('Erro ao buscar logs.');
        }
    });
}
// #endregion 🔹 Logger
// #region 🔹 Tratamentos gerais de respostas e erros
/**
 * Responde a uma requisição com uma estrutura padrão.
 *
 * @param res - O objeto de resposta do Express.
 * @param status - O código de status HTTP.
 * @param dados - Os dados a serem retornados (opcional).
 * @param mensagem - A mensagem a ser retornada (opcional).
 */
function responderAPI(res, status, dados, mensagem) {
    const sucesso = status === enums_1.HTTPStatus.OK || status === enums_1.HTTPStatus.CREATED;
    const resposta = Object.assign(Object.assign({ sucesso }, (mensagem && { mensagem })), (dados !== undefined && dados !== null ? { dados } : {}));
    if (!res.headersSent) {
        return res.status(status).json(resposta);
    }
}
/**
 * Formata os erros de validação do Zod para um formato padronizado e traduzido para PT-BR.
 *
 * @param erro - O erro gerado pelo Zod.
 * @returns Lista formatada de erros.
 */
function formatarErrosDeValidacao(erro) {
    return erro.errors.map((e) => {
        let mensagemTraduzida = e.message;
        let valorRecebido = "received" in e ? `Valor recebido: '${e.received}'` : "";
        let opcoesValidas = "options" in e ? `Valores aceitos: ${e.options.join(', ')}` : "";
        switch (e.code) {
            case "invalid_enum_value":
                mensagemTraduzida = `Valor inválido para '${e.path.join('.')}'. ${valorRecebido} | ${opcoesValidas}`;
                break;
            case "invalid_type":
                mensagemTraduzida = `O campo '${e.path.join('.')}' espera um valor do tipo '${e.expected}', mas recebeu '${e.received}'`;
                break;
            case "too_small":
                mensagemTraduzida = `O campo '${e.path.join('.')}' deve ter no mínimo ${e.minimum} caracteres. ${valorRecebido}`;
                break;
            case "too_big":
                mensagemTraduzida = `O campo '${e.path.join('.')}' deve ter no máximo ${e.maximum} caracteres. ${valorRecebido}`;
                break;
            case "unrecognized_keys":
                mensagemTraduzida = `O campo '${e.keys.join(", ")}' é desconhecido e não deve fazer parte desta requisição.`;
                break;
            case "invalid_date":
                mensagemTraduzida = `O campo '${e.path.join('.')}' deve ser uma data válida. ${valorRecebido}`;
                break;
            case "custom":
                mensagemTraduzida = e.message;
                break;
            default:
                mensagemTraduzida = `${e.message} ${valorRecebido}`.trim();
        }
        return {
            propriedade: e.path.join('.') || 'desconhecida',
            erro: mensagemTraduzida
        };
    });
}
// #endregion 🔹 Tratamentos gerais de respostas e erros
// #region 🔹 Métodos para CRUD
/**
 * Busca um registro pelo ID em qualquer tabela.
 */
function buscarPorId(tabela, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const resultado = yield (0, db_1.executarQuery)(`SELECT * FROM ${tabela} WHERE id = ?`, [id]);
        return resultado.length ? resultado[0] : { erro: `${tabela} não encontrado` };
    });
}
/**
 * Salva um novo registro em qualquer tabela.
 */
function salvarRegistro(tabela, dados) {
    return __awaiter(this, void 0, void 0, function* () {
        const colunas = Object.keys(dados).join(', ');
        const valores = Object.values(dados);
        const placeholders = valores.map(() => '?').join(', ');
        const query = `INSERT INTO ${tabela} (${colunas}) VALUES (${placeholders})`;
        const resultado = yield (0, db_1.executarQuery)(query, valores);
        return Object.assign({ id: resultado.insertId }, dados);
    });
}
/**
 * Atualiza um registro pelo ID em qualquer tabela.
 */
function atualizarRegistro(tabela, id, dados) {
    return __awaiter(this, void 0, void 0, function* () {
        const colunas = Object.keys(dados).map(coluna => `${coluna} = ?`).join(', ');
        const valores = Object.values(dados);
        valores.push(id);
        const query = `UPDATE ${tabela} SET ${colunas} WHERE id = ?`;
        yield (0, db_1.executarQuery)(query, valores);
        return buscarPorId(tabela, id);
    });
}
/**
 * Exclui um registro pelo ID em qualquer tabela.
 */
function excluirRegistro(tabela, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const existe = yield buscarPorId(tabela, id);
        if ('erro' in existe)
            return existe;
        yield (0, db_1.executarQuery)(`DELETE FROM ${tabela} WHERE id = ?`, [id]);
        return { id };
    });
}
/**
 * Consulta registros filtrando por coluna opcionalmente.
 */
function consultarDados(tabela, coluna, valor) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = `SELECT * FROM ${tabela}`;
        const parametros = [];
        if (coluna && valor !== undefined) {
            query += ` WHERE ${coluna} = ?`;
            parametros.push(valor);
        }
        return yield (0, db_1.executarQuery)(query, parametros);
    });
}
// #endregion

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
exports.registrarLog = registrarLog;
exports.tratarErro = tratarErro;
exports.responderAPI = responderAPI;
exports.converterDataISOparaDDMMAAAA = converterDataISOparaDDMMAAAA;
const winston_1 = require("winston");
const logService_1 = require("../services/logService");
const enums_1 = require("./enums");
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
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.colorize({ all: true }), winston_1.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)),
    transports: [
        new winston_1.transports.Console({
            level: enums_1.TiposDeLog.DEBUG,
        })
    ]
});
/**
 * Registra uma mensagem de log.
 *
 * @param tipo - Tipo de log (ERRO, ALERTA, SUCESSO, INFO, DEBUG).
 * @param mensagem - Mensagem a ser registrada.
 *
 * Usa o `logger` para mostrar no console e o `LogService` para salvar. O nível DEBUG não é salvo.
 */
function registrarLog(tipo, mensagem) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.log(tipo, mensagem);
        yield logService_1.LogService.registrarLog(tipo, mensagem);
    });
}
// #endregion 🔹 Logger
// #region 🔹 Tratamentos gerais de respostas e erros
/**
 * Lida com um erro, registrando no banco e passando adiante.
 *
 * @param erro - O erro que ocorreu.
 * @param mensagem - Mensagem extra para contexto.
 * @param next - Função do Express para continuar o fluxo.
 *
 * Registra o erro com `registrarLog` e chama `next` para seguir o baile.
 */
function tratarErro(mensagem, erro, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const mensagemErro = (erro instanceof Error) ? erro.message : 'Erro desconhecido';
        yield registrarLog(enums_1.TiposDeLog.ERRO, `${mensagem}: ${mensagemErro}`);
        next(erro);
    });
}
/**
 * Responde a uma requisição com uma estrutura padrão.
 *
 * @param res - O objeto de resposta do Express.
 * @param status - O código de status HTTP.
 * @param dados - Os dados a serem retornados (opcional).
 * @param mensagem - A mensagem a ser retornada (opcional).
 */
function responderAPI(res, status, dados, mensagem) {
    const response = {
        sucesso: status === enums_1.HTTPStatus.OK || status === enums_1.HTTPStatus.CREATED,
        mensagem: mensagem || (status === enums_1.HTTPStatus.OK || status === enums_1.HTTPStatus.CREATED ?
            'Requisição realizada com sucesso.' :
            'Ocorreu um erro na requisição'),
        dados: dados || null,
    };
    return res.status(status).json(response);
}
// #endregion 🔹 Tratamentos gerais de respostas e erros
//# region 🔹 Conversores
/**
 * Converte uma data do formato ISO8601 ou tipo Date para DD/MM/AAAA.
 *
 * @param data - A data no formato ISO8601 ou objeto Date.
 * @returns A data no formato DD/MM/AAAA.
 */
function converterDataISOparaDDMMAAAA(data) {
    const date = typeof data === 'string' ? new Date(data) : data;
    const dia = String(date.getUTCDate()).padStart(2, '0');
    const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
    const ano = date.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
}
// #endregion 🔹 Conversores

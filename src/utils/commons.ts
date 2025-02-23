import { createLogger, format, transports, addColors } from 'winston';
import { NextFunction } from 'express';
import { LogService } from '../services/logService';
import { HTTPStatus, TiposDeLog, Operacoes, CategoriasDeLog } from './enums';
import { Response } from 'express';

//#region 🔹 Logger
const logsCustomizados = {
    levels: {
        [TiposDeLog.ERRO]: 0,
        [TiposDeLog.ALERTA]: 1,
        [TiposDeLog.SUCESSO]: 2,
        [TiposDeLog.INFO]: 3,
        [TiposDeLog.DEBUG]: 4
    },

    colors: {
        [TiposDeLog.ERRO]: 'red',
        [TiposDeLog.ALERTA]: 'yellow',
        [TiposDeLog.SUCESSO]: 'green',
        [TiposDeLog.INFO]: 'blue',
        [TiposDeLog.DEBUG]: 'magenta'
    }
};

addColors(logsCustomizados.colors);

const logger = createLogger({
    levels: logsCustomizados.levels,
    format: format.combine(
        format.timestamp(),
        format.colorize({ all: true }),
        format.printf(({ timestamp, level, message }) => `[${timestamp}][${level}]${message}`)
    ),
    transports: [
        new transports.Console({
            level: TiposDeLog.DEBUG,
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
export async function registrarLog(tipoDeLog: TiposDeLog, operacao: Operacoes, categoria: CategoriasDeLog, detalhe: string, usuarioId?: string, next?: NextFunction) {

    logger.log(tipoDeLog, `[${operacao}][${categoria}]: ${detalhe}`);

    if (tipoDeLog === TiposDeLog.ERRO) {
        next?.(new Error(detalhe));
    }

    if (![TiposDeLog.DEBUG].includes(tipoDeLog)) {
        await LogService.registrarLog(tipoDeLog, operacao, categoria, detalhe, usuarioId);
    }
}

/**
 * Busca logs associados a um usuário específico.
 *
 * @param usuarioId - ID do usuário cujos logs devem ser buscados.
 * @returns Uma lista de logs associados ao usuário.
 */
export async function buscarLogsPorUsuario(usuarioId: string) {
    try {
        const logs = await LogService.buscarLogsPorUsuario(usuarioId);
        return logs;
    } catch (erro) {
        await registrarLog(
            TiposDeLog.DEBUG,
            Operacoes.BUSCA,
            CategoriasDeLog.LOG,
            JSON.stringify(erro),
            usuarioId
        );
        throw new Error('Erro ao buscar logs.');
    }
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
export function responderAPI(res: Response, status: HTTPStatus, dados?: any, mensagem?: string) {
    let response: any = {
        sucesso: status === HTTPStatus.OK || status === HTTPStatus.CREATED,
        mensagem: mensagem || (status === HTTPStatus.OK || status === HTTPStatus.CREATED
            ? 'Requisição realizada com sucesso.'
            : 'Ocorreu um erro na requisição'),
        dados: dados ?? null,
    };

    try {
        response.dados = JSON.parse(JSON.stringify(response.dados));
    } catch (erro) {
        response.dados = null;
    }

    if (!res.headersSent) {
        return res.status(status).json(response);
    }
}

// #endregion 🔹 Tratamentos gerais de respostas e erros

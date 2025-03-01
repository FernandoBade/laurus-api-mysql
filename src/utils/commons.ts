import { HTTPStatus, TiposDeLog, Operacoes, CategoriasDeLog, NomeDaTabela } from './enums';
import { createLogger, format, transports, addColors } from 'winston';
import { NextFunction } from 'express';
import { LogService } from '../services/logService';
import { Response } from 'express';
import db from './db';

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

// #region 🔹 Métodos para CRUD

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

/**
 * Busca um registro pelo ID em qualquer tabela.
 */
export async function buscarPorId(tabela: NomeDaTabela, id: number) {
    const resultado: any = await executarQuery(`SELECT * FROM ${tabela} WHERE id = ?`, [id]);
    return resultado.length ? resultado[0] : { erro: `${tabela} não encontrado` };
}

/**
 * Salva um novo registro em qualquer tabela.
 */
export async function salvarRegistro(tabela: NomeDaTabela, dados: any) {
    const colunas = Object.keys(dados).join(', ');
    const valores = Object.values(dados);
    const placeholders = valores.map(() => '?').join(', ');

    const query = `INSERT INTO ${tabela} (${colunas}) VALUES (${placeholders})`;
    const resultado: any = await executarQuery(query, valores);

    return { id: resultado.insertId, ...dados };
}

/**
 * Atualiza um registro pelo ID em qualquer tabela.
 */
export async function atualizarRegistro(tabela: NomeDaTabela, id: number, dados: any) {
    const colunas = Object.keys(dados).map(coluna => `${coluna} = ?`).join(', ');
    const valores = Object.values(dados);
    valores.push(id);

    const query = `UPDATE ${tabela} SET ${colunas} WHERE id = ?`;
    await executarQuery(query, valores);

    return buscarPorId(tabela, id);
}

/**
 * Exclui um registro pelo ID em qualquer tabela.
 */
export async function excluirRegistro(tabela: NomeDaTabela, id: number) {
    const existe = await buscarPorId(tabela, id);
    if ('erro' in existe) return existe;

    await executarQuery(`DELETE FROM ${tabela} WHERE id = ?`, [id]);
    return { id };
}

/**
 * Consulta registros filtrando por coluna opcionalmente.
 */
export async function consultarDados(tabela: NomeDaTabela, coluna?: string, valor?: any) {
    let query = `SELECT * FROM ${tabela}`;
    const params: any[] = [];

    if (coluna && valor !== undefined) {
        query += ` WHERE ${coluna} = ?`;
        params.push(valor);
    }

    return await executarQuery(query, params);
}

// #endregion

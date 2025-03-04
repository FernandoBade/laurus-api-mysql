import { HTTPStatus, TiposDeLog, Operacoes, CategoriasDeLog, NomeDaTabela } from './enumeradores';
import { createLogger, format, transports, addColors } from 'winston';
import { NextFunction } from 'express';
import db, { executarQuery } from './bancoDeDados';
import { LogServico } from '../servicos/logServico';
import { Response } from 'express';
import { ZodError, ZodIssue } from 'zod';

//#region 🔹 Logger
const logsCustomizados = {
    levels: {
        [TiposDeLog.ERRO]: 0,
        [TiposDeLog.ALERTA]: 1,
        [TiposDeLog.SUCESSO]: 2,
        [TiposDeLog.DEBUG]: 4
    },

    colors: {
        [TiposDeLog.ERRO]: 'red',
        [TiposDeLog.ALERTA]: 'yellow',
        [TiposDeLog.SUCESSO]: 'green',
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
export async function registrarLog(
    tipoDeLog: TiposDeLog,
    operacao: Operacoes,
    categoria: CategoriasDeLog,
    detalhe: any,
    usuarioId?: number,
    next?: NextFunction
) {
    const mensagemLog = typeof detalhe === "object" && Object.keys(detalhe).length === 0
        ? "Erro desconhecido"
        : JSON.stringify(detalhe);

    logger.log(tipoDeLog, `[${operacao}][${categoria}]: ${mensagemLog}`);

    if (tipoDeLog === TiposDeLog.ERRO) {
        next?.(new Error(mensagemLog));
    }

    if (tipoDeLog !== TiposDeLog.DEBUG) {
        await LogServico.registrarLog(tipoDeLog, operacao, categoria, mensagemLog, usuarioId);
    }
}

/**
 * Busca logs associados a um usuário específico.
 *
 * @param usuarioId - ID do usuário cujos logs devem ser buscados.
 * @returns Uma lista de logs associados ao usuário.
 */
export async function buscarLogsPorUsuario(usuarioId: number) {
    try {
        const logs = await LogServico.buscarLogsPorUsuario(usuarioId);
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
    const sucesso = status === HTTPStatus.OK || status === HTTPStatus.CREATED;
    const resposta: any = {
        sucesso,
        ...(mensagem && { mensagem }),
        ...(dados !== undefined && dados !== null ? { dados } : {})
    };

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
export function formatarErrosDeValidacao(erro: ZodError) {
    return erro.errors.map((e: ZodIssue) => {
        let mensagemTraduzida = e.message;
        let valorRecebido = "received" in e ? `Valor recebido: '${e.received}'` : "";
        let opcoesValidas = "options" in e ? `Valores aceitos: ${e.options.join(', ')}` : "";

        switch (e.code) {
            case "invalid_enum_value":
                mensagemTraduzida = `Valor inválido para '${e.path.join('.')}'. ${valorRecebido} | ${opcoesValidas}`;
                break;
            case "invalid_type":
                mensagemTraduzida = `O campo '${e.path.join('.')}' espera um valor do tipo '${(e as any).expected}', mas recebeu '${(e as any).received}'`;
                break;
            case "too_small":
                mensagemTraduzida = `O campo '${e.path.join('.')}' deve ter no mínimo ${(e as any).minimum} caracteres. ${valorRecebido}`;
                break;
            case "too_big":
                mensagemTraduzida = `O campo '${e.path.join('.')}' deve ter no máximo ${(e as any).maximum} caracteres. ${valorRecebido}`;
                break;
            case "unrecognized_keys":
                mensagemTraduzida = `O campo '${(e as any).keys.join(", ")}' é desconhecido e não deve fazer parte desta requisição.`;
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
    const parametros: any[] = [];

    if (coluna && valor !== undefined) {
        query += ` WHERE ${coluna} = ?`;
        parametros.push(valor);
    }

    return await executarQuery(query, parametros);
}


export { executarQuery };
// #endregion

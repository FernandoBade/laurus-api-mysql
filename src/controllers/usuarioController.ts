import { Request, Response, NextFunction } from 'express';
import { UsuarioService } from '../services/usuarioService';
import { formatarErrosDeValidacao, registrarLog, responderAPI } from '../utils/commons';
import { CategoriasDeLog, HTTPStatus, Operacoes, TiposDeLog } from '../utils/enums';
import { criarUsuarioSchema, atualizarUsuarioSchema } from '../utils/validator';

class UsuarioController {

    /**
     * Cria um novo usuário.
     * @param req - Requisição contendo os dados do usuário.
     * @param res - Resposta da API.
     * @param next - Middleware para tratamento de erros.
     */
    static async criarUsuario(req: Request, res: Response, next: NextFunction) {
        const usuarioService = new UsuarioService();
        const dadosUsuario = req.body;

        try {
            const resultadoParse = criarUsuarioSchema.safeParse(dadosUsuario);

            if (!resultadoParse.success) {
                return responderAPI(
                    res,
                    HTTPStatus.BAD_REQUEST,
                    formatarErrosDeValidacao(resultadoParse.error),
                    "Erro de validação"
                );
            }

            const novoUsuario = await usuarioService.criarUsuario(resultadoParse.data);

            if ('erro' in novoUsuario) {
                return responderAPI(res, HTTPStatus.BAD_REQUEST, undefined, novoUsuario.erro);
            }

            await registrarLog(TiposDeLog.SUCESSO, Operacoes.CRIACAO, CategoriasDeLog.USUARIO, novoUsuario, novoUsuario.id);
            return responderAPI(res, HTTPStatus.CREATED, novoUsuario);
        } catch (erro) {
            await registrarLog(TiposDeLog.ERRO, Operacoes.CRIACAO, CategoriasDeLog.USUARIO, JSON.stringify(erro), undefined, next);
            return responderAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Erro ao criar usuário");
        }
    }

    /**
     * Lista todos os usuários cadastrados.
     */
    static async listarUsuarios(req: Request, res: Response, next: NextFunction) {
        try {
            const usuarioService = new UsuarioService();
            const usuariosEncontrados = await usuarioService.listarUsuarios();

            return responderAPI(res, HTTPStatus.OK, usuariosEncontrados, usuariosEncontrados.usuarios.length ? undefined : "Nenhum usuário encontrado");
        } catch (erro) {
            await registrarLog(TiposDeLog.ERRO, Operacoes.BUSCA, CategoriasDeLog.USUARIO, JSON.stringify(erro), undefined, next);
            return responderAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Erro ao listar usuários");
        }
    }

    /**
     * Obtém um usuário específico pelo ID.
     */
    static async obterUsuarioPorId(req: Request, res: Response, next: NextFunction) {
        const usuarioId = Number(req.params.id);

        if (isNaN(usuarioId) || usuarioId <= 0) {
            return responderAPI(res, HTTPStatus.BAD_REQUEST, undefined, "Nenhum ID de usuário válido foi informado");
        }

        try {
            const usuarioService = new UsuarioService();
            const usuario = await usuarioService.obterUsuarioPorId(usuarioId);

            if ('erro' in usuario) {
                return responderAPI(res, HTTPStatus.BAD_REQUEST, undefined, usuario);
            }

            return responderAPI(res, HTTPStatus.OK, usuario);
        } catch (erro) {
            await registrarLog(TiposDeLog.ERRO, Operacoes.BUSCA, CategoriasDeLog.USUARIO, JSON.stringify(erro), usuarioId, next);
            return responderAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Erro ao obter usuário");
        }
    }

    /**
     * Busca usuários pelo e-mail (parcialmente, usando LIKE).
     */
    static async obterUsuariosPorEmail(req: Request, res: Response, next: NextFunction) {
        const termoBuscado = req.query.email as string;

        if (!termoBuscado || termoBuscado.length < 3) {
            return responderAPI(res, HTTPStatus.BAD_REQUEST, undefined, "O termo de busca deve ter pelo menos 3 caracteres");
        }

        try {
            const usuarioService = new UsuarioService();
            const usuariosEncontrados = await usuarioService.obterUsuariosPorEmail(termoBuscado);

            return responderAPI(res, HTTPStatus.OK, usuariosEncontrados, usuariosEncontrados.usuarios.length ? undefined : "Nenhum usuário encontrado");
        } catch (erro) {
            await registrarLog(TiposDeLog.ERRO, Operacoes.BUSCA, CategoriasDeLog.USUARIO, JSON.stringify(erro), undefined, next);
            return responderAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Erro ao obter usuário");
        }
    }

    /**
     * Atualiza os dados de um usuário pelo ID.
     */
    static async atualizarUsuario(req: Request, res: Response, next: NextFunction) {
        const usuarioId = Number(req.params.id);

        if (isNaN(usuarioId) || usuarioId <= 0) {
            return responderAPI(res, HTTPStatus.BAD_REQUEST, undefined, "Nenhum ID de usuário válido foi informado");
        }

        try {
            const resultadoParse = atualizarUsuarioSchema.safeParse(req.body);

            if (!resultadoParse.success) {
                return responderAPI(
                    res,
                    HTTPStatus.BAD_REQUEST,
                    formatarErrosDeValidacao(resultadoParse.error),
                    "Erro de validação"
                );
            }

            const usuarioService = new UsuarioService();
            const usuarioAtualizado = await usuarioService.atualizarUsuario(usuarioId, resultadoParse.data);

            if ('erro' in usuarioAtualizado) {
                return responderAPI(res, HTTPStatus.BAD_REQUEST, undefined, usuarioAtualizado);
            }

            await registrarLog(TiposDeLog.SUCESSO, Operacoes.ATUALIZACAO, CategoriasDeLog.USUARIO, usuarioAtualizado, usuarioAtualizado.id);
            return responderAPI(res, HTTPStatus.OK, usuarioAtualizado);

        } catch (erro) {
            const mensagemErro = erro instanceof Error ? erro.message : JSON.stringify(erro) || "Erro desconhecido";

            await registrarLog(
                TiposDeLog.ERRO,
                Operacoes.ATUALIZACAO,
                CategoriasDeLog.USUARIO,
                mensagemErro,
                usuarioId,
                next
            );

            return responderAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Erro ao atualizar usuário");
        }
    }

    /**
     * Exclui um usuário pelo ID.
     */
    static async excluirUsuario(req: Request, res: Response, next: NextFunction) {
        const usuarioId = Number(req.params.id);

        if (isNaN(usuarioId) || usuarioId <= 0) {
            return responderAPI(res, HTTPStatus.BAD_REQUEST, undefined, "Nenhum ID de usuário válido foi informado");
        }

        try {
            const usuarioService = new UsuarioService();
            const resultado = await usuarioService.excluirUsuario(usuarioId);

            if ('erro' in resultado) {
                return responderAPI(res, HTTPStatus.BAD_REQUEST, undefined, resultado.erro);
            }

            await registrarLog(TiposDeLog.SUCESSO, Operacoes.EXCLUSAO, CategoriasDeLog.USUARIO, resultado, usuarioId, next);
            return responderAPI(res, HTTPStatus.OK, { id: usuarioId });
        } catch (erro) {
            await registrarLog(TiposDeLog.ERRO, Operacoes.EXCLUSAO, CategoriasDeLog.USUARIO, JSON.stringify(erro), usuarioId, next);
            return responderAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Erro ao excluir usuário");
        }
    }
}

export default UsuarioController;
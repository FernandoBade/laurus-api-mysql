import { Request, Response, NextFunction } from 'express';
import { UsuarioService } from '../services/usuarioService';
import { registrarLog, responderAPI } from '../utils/commons';
import { CategoriasDeLog, HTTPStatus, Operacoes, TiposDeLog } from '../utils/enums';
import { criarUsuarioSchema, atualizarUsuarioSchema } from '../utils/validator';

class UsuarioController {
    static async criarUsuario(req: Request, res: Response, next: NextFunction) {
        const dadosUsuario = req.body;

        try {
            const resultadoParse = criarUsuarioSchema.safeParse(dadosUsuario);
            if (!resultadoParse.success) {
                const mensagensDeErro = resultadoParse.error.errors.map(e => e.message);
                return responderAPI(res, HTTPStatus.BAD_REQUEST, { erros: mensagensDeErro });
            }

            const usuarioCriado = await UsuarioService.criarUsuario(resultadoParse.data);

            if (usuarioCriado && 'erro' in usuarioCriado) {
                return responderAPI(res, HTTPStatus.BAD_REQUEST, { erro: usuarioCriado.erro });
            }

            await registrarLog(TiposDeLog.SUCESSO, Operacoes.CRIACAO, CategoriasDeLog.USUARIO, JSON.stringify(dadosUsuario), usuarioCriado.id);
            return responderAPI(res, HTTPStatus.CREATED, usuarioCriado);

        } catch (erro) {
            await registrarLog(TiposDeLog.ERRO, Operacoes.CRIACAO, CategoriasDeLog.USUARIO, JSON.stringify(erro), undefined, next);
            return responderAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, { erro: "Erro ao criar usuário" });
        }
    }

    static async listarUsuarios(req: Request, res: Response, next: NextFunction) {
        try {
            const usuarios = await UsuarioService.listarUsuarios();

            return responderAPI(res, HTTPStatus.OK, usuarios);

        } catch (erro) {
            await registrarLog(TiposDeLog.ERRO, Operacoes.BUSCA, CategoriasDeLog.USUARIO, JSON.stringify(erro), undefined, next);
            return responderAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, { erro: "Erro ao listar usuários" });
        }
    }

    static async obterUsuarioPorId(req: Request, res: Response, next: NextFunction) {
        const usuarioId = req.params.id;

        if (!usuarioId) {
            return responderAPI(res, HTTPStatus.BAD_REQUEST, "Nenhum ID de usuário informado");
        }

        try {
            const usuario = await UsuarioService.obterUsuarioPorId(usuarioId);

            if (usuario && 'erro' in usuario) {
                return responderAPI(res, HTTPStatus.BAD_REQUEST, { mensagem: usuario.erro });
            }

            return responderAPI(res, HTTPStatus.OK, usuario);

        } catch (erro) {
            await registrarLog(TiposDeLog.ERRO, Operacoes.BUSCA, CategoriasDeLog.USUARIO, JSON.stringify(erro), usuarioId, next);
            return responderAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, { erro: "Erro ao obter usuário" });
        }
    }

    static async obterUsuariosPorEmail(termoBuscado: string, req: Request, res: Response, next: NextFunction) {
        if (!termoBuscado || termoBuscado.length < 3) {
            return responderAPI(res, HTTPStatus.BAD_REQUEST, [], "O termo de busca deve ter pelo menos 3 caracteres");
        }

        try {

            const usuarios = await UsuarioService.obterUsuariosPorEmail(termoBuscado);

            if (!usuarios.total) {
                return responderAPI(res, HTTPStatus.OK, [], "Nenhum usuário encontrado");
            }

            return responderAPI(res, HTTPStatus.OK, usuarios);

        } catch (erro) {
            await registrarLog(TiposDeLog.ERRO, Operacoes.BUSCA, CategoriasDeLog.USUARIO, JSON.stringify(erro), undefined, next);
            return responderAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, { erro: "Erro ao obter usuário" });
        }
    }

    static async atualizarUsuario(req: Request, res: Response, next: NextFunction) {
        const dadosAtualizados = req.body;

        if (!dadosAtualizados) {
            return responderAPI(res, HTTPStatus.BAD_REQUEST, null, 'Dados inválidos');
        }

        try {
            const resultadoParse = atualizarUsuarioSchema.safeParse(dadosAtualizados);
            if (!resultadoParse.success) {
                const mensagensDeErro = resultadoParse.error.errors.map(err => err.message.replace(/"/g, "'"));
                return responderAPI(res, HTTPStatus.BAD_REQUEST, { erros: mensagensDeErro });
            }

            const { ...dadosParaAtualizar } = resultadoParse.data;
            const usuarioAtualizado = await UsuarioService.atualizarUsuario(req.params.id, dadosParaAtualizar);

            if (usuarioAtualizado && 'erro' in usuarioAtualizado) {
                return responderAPI(res, HTTPStatus.BAD_REQUEST, { mensagem: usuarioAtualizado.erro });
            }

            responderAPI(res, HTTPStatus.OK, usuarioAtualizado);
            await registrarLog(TiposDeLog.SUCESSO, Operacoes.ATUALIZACAO, CategoriasDeLog.USUARIO, JSON.stringify(dadosAtualizados), req.params.id);
            return;

        } catch (erro) {
            await registrarLog(TiposDeLog.ERRO, Operacoes.ATUALIZACAO, CategoriasDeLog.USUARIO, JSON.stringify(erro), req.params.id, next);
            return responderAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, { erro: "Erro ao atualizar usuário" });
        }
    }

    static async excluirUsuario(req: Request, res: Response, next: NextFunction) {
        const usuarioId = req.params.id;

        if (!usuarioId) {
            return responderAPI(res, HTTPStatus.BAD_REQUEST, "Nenhum ID de usuário informado");
        }

        try {
            const resultado = await UsuarioService.excluirUsuario(usuarioId);

            if (resultado && 'erro' in resultado) {
                return responderAPI(res, HTTPStatus.BAD_REQUEST, resultado, "Erro ao excluir usuário");
            }

            responderAPI(res, HTTPStatus.OK, { id: usuarioId }, "Usuário excluído com sucesso");
            return registrarLog(TiposDeLog.SUCESSO, Operacoes.EXCLUSAO, CategoriasDeLog.USUARIO, JSON.stringify({ tipo: "Usuário", id: usuarioId }), undefined);

        } catch (erro) {
            await registrarLog(TiposDeLog.ERRO, Operacoes.EXCLUSAO, CategoriasDeLog.USUARIO, JSON.stringify(erro), usuarioId, next);
            return responderAPI(res, HTTPStatus.INTERNAL_SERVER_ERROR, { erro: "Erro ao excluir usuário" });
        }
    }
}

export default UsuarioController;
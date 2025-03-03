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
const usuarioService_1 = require("../services/usuarioService");
const commons_1 = require("../utils/commons");
const enums_1 = require("../utils/enums");
const validator_1 = require("../utils/validator");
class UsuarioController {
    /**
     * Cria um novo usuário.
     * @param req - Requisição contendo os dados do usuário.
     * @param res - Resposta da API.
     * @param next - Middleware para tratamento de erros.
     */
    static criarUsuario(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarioService = new usuarioService_1.UsuarioService();
            const dadosUsuario = req.body;
            try {
                const resultadoParse = validator_1.criarUsuarioSchema.safeParse(dadosUsuario);
                if (!resultadoParse.success) {
                    return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.BAD_REQUEST, (0, commons_1.formatarErrosDeValidacao)(resultadoParse.error), "Erro de validação");
                }
                const novoUsuario = yield usuarioService.criarUsuario(resultadoParse.data);
                if ('erro' in novoUsuario) {
                    return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.BAD_REQUEST, undefined, novoUsuario.erro);
                }
                yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.SUCESSO, enums_1.Operacoes.CRIACAO, enums_1.CategoriasDeLog.USUARIO, novoUsuario, novoUsuario.id);
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.CREATED, novoUsuario);
            }
            catch (erro) {
                yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.ERRO, enums_1.Operacoes.CRIACAO, enums_1.CategoriasDeLog.USUARIO, JSON.stringify(erro), undefined, next);
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Erro ao criar usuário");
            }
        });
    }
    /**
     * Lista todos os usuários cadastrados.
     */
    static listarUsuarios(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usuarioService = new usuarioService_1.UsuarioService();
                const usuariosEncontrados = yield usuarioService.listarUsuarios();
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.OK, usuariosEncontrados, usuariosEncontrados.usuarios.length ? undefined : "Nenhum usuário encontrado");
            }
            catch (erro) {
                yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.ERRO, enums_1.Operacoes.BUSCA, enums_1.CategoriasDeLog.USUARIO, JSON.stringify(erro), undefined, next);
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Erro ao listar usuários");
            }
        });
    }
    /**
     * Obtém um usuário específico pelo ID.
     */
    static obterUsuarioPorId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarioId = Number(req.params.id);
            if (isNaN(usuarioId) || usuarioId <= 0) {
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.BAD_REQUEST, undefined, "Nenhum ID de usuário válido foi informado");
            }
            try {
                const usuarioService = new usuarioService_1.UsuarioService();
                const usuario = yield usuarioService.obterUsuarioPorId(usuarioId);
                if ('erro' in usuario) {
                    return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.BAD_REQUEST, undefined, usuario);
                }
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.OK, usuario);
            }
            catch (erro) {
                yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.ERRO, enums_1.Operacoes.BUSCA, enums_1.CategoriasDeLog.USUARIO, JSON.stringify(erro), usuarioId, next);
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Erro ao obter usuário");
            }
        });
    }
    /**
     * Busca usuários pelo e-mail (parcialmente, usando LIKE).
     */
    static obterUsuariosPorEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const termoBuscado = req.query.email;
            if (!termoBuscado || termoBuscado.length < 3) {
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.BAD_REQUEST, undefined, "O termo de busca deve ter pelo menos 3 caracteres");
            }
            try {
                const usuarioService = new usuarioService_1.UsuarioService();
                const usuariosEncontrados = yield usuarioService.obterUsuariosPorEmail(termoBuscado);
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.OK, usuariosEncontrados, usuariosEncontrados.usuarios.length ? undefined : "Nenhum usuário encontrado");
            }
            catch (erro) {
                yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.ERRO, enums_1.Operacoes.BUSCA, enums_1.CategoriasDeLog.USUARIO, JSON.stringify(erro), undefined, next);
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Erro ao obter usuário");
            }
        });
    }
    /**
     * Atualiza os dados de um usuário pelo ID.
     */
    static atualizarUsuario(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarioId = Number(req.params.id);
            if (isNaN(usuarioId) || usuarioId <= 0) {
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.BAD_REQUEST, undefined, "Nenhum ID de usuário válido foi informado");
            }
            try {
                const resultadoParse = validator_1.atualizarUsuarioSchema.safeParse(req.body);
                if (!resultadoParse.success) {
                    return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.BAD_REQUEST, (0, commons_1.formatarErrosDeValidacao)(resultadoParse.error), "Erro de validação");
                }
                const usuarioService = new usuarioService_1.UsuarioService();
                const usuarioAtualizado = yield usuarioService.atualizarUsuario(usuarioId, resultadoParse.data);
                if ('erro' in usuarioAtualizado) {
                    return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.BAD_REQUEST, undefined, usuarioAtualizado);
                }
                yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.SUCESSO, enums_1.Operacoes.ATUALIZACAO, enums_1.CategoriasDeLog.USUARIO, usuarioAtualizado, usuarioAtualizado.id);
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.OK, usuarioAtualizado);
            }
            catch (erro) {
                const mensagemErro = erro instanceof Error ? erro.message : JSON.stringify(erro) || "Erro desconhecido";
                yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.ERRO, enums_1.Operacoes.ATUALIZACAO, enums_1.CategoriasDeLog.USUARIO, mensagemErro, usuarioId, next);
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Erro ao atualizar usuário");
            }
        });
    }
    /**
     * Exclui um usuário pelo ID.
     */
    static excluirUsuario(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarioId = Number(req.params.id);
            if (isNaN(usuarioId) || usuarioId <= 0) {
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.BAD_REQUEST, undefined, "Nenhum ID de usuário válido foi informado");
            }
            try {
                const usuarioService = new usuarioService_1.UsuarioService();
                const resultado = yield usuarioService.excluirUsuario(usuarioId);
                if ('erro' in resultado) {
                    return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.BAD_REQUEST, undefined, resultado.erro);
                }
                yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.SUCESSO, enums_1.Operacoes.EXCLUSAO, enums_1.CategoriasDeLog.USUARIO, resultado, usuarioId, next);
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.OK, { id: usuarioId });
            }
            catch (erro) {
                yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.ERRO, enums_1.Operacoes.EXCLUSAO, enums_1.CategoriasDeLog.USUARIO, JSON.stringify(erro), usuarioId, next);
                return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.INTERNAL_SERVER_ERROR, undefined, "Erro ao excluir usuário");
            }
        });
    }
}
exports.default = UsuarioController;

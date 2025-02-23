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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const usuarioService_1 = require("../services/usuarioService");
const commons_1 = require("../utils/commons");
const enums_1 = require("../utils/enums");
const validator_1 = require("../utils/validator");
class UsuarioController {
    static cadastrarUsuario(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dadosUsuario = req.body;
                const parseResult = validator_1.criarUsuarioSchema.safeParse(dadosUsuario);
                if (!parseResult.success) {
                    const mensagensDeErro = parseResult.error.errors.map(err => err.message.replace(/"/g, "'"));
                    return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.BAD_REQUEST, { erros: mensagensDeErro });
                }
                const novoUsuario = yield usuarioService_1.UsuarioService.cadastrarUsuario(parseResult.data);
                (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.CREATED, novoUsuario);
                yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.SUCESSO, `Usuário cadastrado: ${JSON.stringify(parseResult.data)}`);
            }
            catch (erro) {
                if (erro instanceof Error && erro.message.includes('O e-mail já está em uso')) {
                    return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.BAD_REQUEST, undefined, erro.message);
                }
                (0, commons_1.tratarErro)('Erro ao cadastrar usuário', erro, next);
            }
        });
    }
    static listarUsuarios(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const usuarios = yield usuarioService_1.UsuarioService.listarUsuarios();
                (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.OK, usuarios);
            }
            catch (erro) {
                (0, commons_1.tratarErro)('Erro ao listar usuários', erro, next);
            }
        });
    }
    static obterUsuarioPorId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const usuario = yield usuarioService_1.UsuarioService.obterUsuarioPorId(id);
                if (!usuario) {
                    return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.NOT_FOUND, undefined, "Usuário não encontrado");
                }
                (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.OK, usuario);
            }
            catch (erro) {
                (0, commons_1.tratarErro)('Erro ao obter usuário por ID', erro, next);
            }
        });
    }
    static obterUsuariosPorEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.query;
                const usuarios = yield usuarioService_1.UsuarioService.obterUsuariosPorEmail(email);
                if (usuarios.length === 0) {
                    return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.NOT_FOUND, { mensagem: "Nenhum usuário encontrado." });
                }
                (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.OK, usuarios);
            }
            catch (erro) {
                (0, commons_1.tratarErro)('Erro ao obter usuários por e-mail', erro, next);
            }
        });
    }
    static atualizarUsuario(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dadosAtualizados = req.body;
                const parseResult = validator_1.atualizarUsuarioSchema.safeParse(dadosAtualizados);
                if (!parseResult.success) {
                    const mensagensDeErro = parseResult.error.errors.map(err => err.message.replace(/"/g, "'"));
                    return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.BAD_REQUEST, { erros: mensagensDeErro });
                }
                const _a = parseResult.data, { id } = _a, dadosParaAtualizar = __rest(_a, ["id"]);
                const usuarioAtualizado = yield usuarioService_1.UsuarioService.atualizarUsuario(id, dadosParaAtualizar);
                if (!usuarioAtualizado) {
                    return (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.NOT_FOUND, { mensagem: "Usuário não encontrado." });
                }
                (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.OK, usuarioAtualizado);
                yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.INFO, `Usuário atualizado: ${JSON.stringify(dadosAtualizados)}`);
            }
            catch (erro) {
                (0, commons_1.tratarErro)('Erro ao atualizar usuário', erro, next);
            }
        });
    }
    static excluirUsuario(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield usuarioService_1.UsuarioService.excluirUsuario(req.params.id);
                (0, commons_1.responderAPI)(res, enums_1.HTTPStatus.OK, undefined, "Usuário excluído com sucesso");
                yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.INFO, `Usuário excluído: ${req.params.id}`);
            }
            catch (erro) {
                (0, commons_1.tratarErro)('Erro ao excluir usuário', erro, next);
            }
        });
    }
}
exports.default = UsuarioController;

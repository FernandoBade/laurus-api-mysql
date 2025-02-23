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
exports.UsuarioService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
class UsuarioService {
    static cadastrarUsuario(dados) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                dados.email = dados.email.trim().toLowerCase();
                const usuarioExistente = yield prisma.usuario.findUnique({
                    where: { email: dados.email },
                });
                if (usuarioExistente) {
                    throw new Error('O e-mail já está em uso. Por favor, escolha outro.');
                }
                const senhaCrypto = yield bcrypt_1.default.hash(dados.senha, 10);
                return yield prisma.usuario.create({
                    data: Object.assign(Object.assign({}, dados), { senha: senhaCrypto }),
                });
            }
            catch (erro) {
                throw new Error('Erro ao criar usuário. Verifique os dados fornecidos.');
            }
        });
    }
    static listarUsuarios() {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.usuario.findMany();
        });
    }
    static obterUsuarioPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.usuario.findUnique({ where: { id } });
        });
    }
    static obterUsuariosPorEmail(emailTermo) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {};
            if (emailTermo) {
                where.email = {
                    contains: emailTermo,
                    mode: 'insensitive'
                };
            }
            const usuarios = yield prisma.usuario.findMany({
                where,
            });
            return usuarios;
        });
    }
    static atualizarUsuario(id, dadosParaAtualizar) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.usuario.update({
                where: { id },
                data: Object.assign({}, dadosParaAtualizar),
            });
        });
    }
    static excluirUsuario(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.usuario.delete({ where: { id } });
        });
    }
}
exports.UsuarioService = UsuarioService;

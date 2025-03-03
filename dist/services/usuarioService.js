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
const enums_1 = require("../utils/enums");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../utils/db");
const commons_1 = require("../utils/commons");
class UsuarioService {
    constructor() {
        this.tabela = enums_1.NomeDaTabela.USUARIO;
    }
    /**
     * Cria um novo usuário garantindo que o e-mail seja único e criptografando a senha.
     * @param dados - Dados do usuário a ser criado.
     * @returns Retorna o usuário criado ou um erro se o e-mail já estiver em uso.
     */
    criarUsuario(dados) {
        return __awaiter(this, void 0, void 0, function* () {
            dados.email = dados.email.trim().toLowerCase();
            const usuarios = yield (0, commons_1.consultarDados)(this.tabela, 'email', dados.email);
            if (usuarios.length > 0) {
                return { erro: 'O e-mail já está em uso' };
            }
            dados.senha = yield bcrypt_1.default.hash(dados.senha, 10);
            const novoUsuario = yield (0, commons_1.salvarRegistro)(this.tabela, dados);
            const usuarioCompleto = yield (0, commons_1.buscarPorId)(this.tabela, novoUsuario.id);
            return usuarioCompleto;
        });
    }
    /**
     * Lista todos os usuários cadastrados.
     * @returns Retorna um array de usuários.
     */
    listarUsuarios() {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarios = yield (0, commons_1.consultarDados)(this.tabela);
            return { total: usuarios.length, usuarios };
        });
    }
    /**
     * Obtém um usuário pelo ID.
     * @param id - ID do usuário.
     * @returns Retorna o usuário encontrado ou um erro caso não exista.
     */
    obterUsuarioPorId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield (0, commons_1.buscarPorId)(this.tabela, id);
            return 'erro' in usuario ? { erro: 'Usuário não encontrado' } : usuario;
        });
    }
    /**
     * Busca usuários pelo e-mail (parcialmente, usando LIKE).
     * @param emailTermo - Termo de busca para o e-mail.
     * @returns Retorna uma lista de usuários que correspondem ao termo de busca.
     */
    obterUsuariosPorEmail(emailTermo) {
        return __awaiter(this, void 0, void 0, function* () {
            const termo = `%${emailTermo}%`;
            const usuarios = yield (0, db_1.executarQuery)(`SELECT * FROM ${this.tabela} WHERE email LIKE ?`, [termo]);
            return { total: usuarios.length, usuarios };
        });
    }
    /**
     * Atualiza um usuário pelo ID e recriptografa a senha se for alterada.
     * @param id - ID do usuário a ser atualizado.
     * @param dados - Dados a serem atualizados.
     * @returns Retorna o usuário atualizado ou um erro caso não seja encontrado.
     */
    atualizarUsuario(id, dados) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield (0, commons_1.buscarPorId)(this.tabela, id);
            if ('erro' in usuario) {
                return { erro: 'Usuário não encontrado' };
            }
            if (dados.senha) {
                dados.senha = yield bcrypt_1.default.hash(dados.senha, 10);
            }
            yield (0, commons_1.atualizarRegistro)(this.tabela, id, dados);
            const usuarioAtualizado = yield (0, commons_1.buscarPorId)(this.tabela, id);
            return usuarioAtualizado;
        });
    }
    /**
     * Exclui um usuário pelo ID.
     * @param id - ID do usuário a ser excluído.
     * @returns Retorna o ID do usuário excluído ou um erro caso não seja encontrado.
     */
    excluirUsuario(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield (0, commons_1.buscarPorId)(this.tabela, id);
            if ('erro' in usuario) {
                return { erro: 'Usuário não encontrado' };
            }
            yield (0, commons_1.excluirRegistro)(this.tabela, id);
            return { id };
        });
    }
}
exports.UsuarioService = UsuarioService;

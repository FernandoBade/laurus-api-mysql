import { NomeDaTabela } from '../utils/enums';
import bcrypt from 'bcrypt';
import {
    buscarPorId,
    salvarRegistro,
    atualizarRegistro,
    excluirRegistro,
    consultarDados,
    executarQuery
} from '../utils/commons';

export class UsuarioService {
    private tabela = NomeDaTabela.USUARIO;

    /**
     * Cria um novo usuário garantindo e-mail único e senha criptografada.
     */
    async criarUsuario(dados: { nome: string; sobrenome: string; email: string; senha: string; dataNascimento?: string }) {
        dados.email = dados.email.trim().toLowerCase();

        const usuarios = await consultarDados(this.tabela, 'email', dados.email);
        if (usuarios.length > 0) {
            return { erro: 'O e-mail já está em uso' };
        }

        dados.senha = await bcrypt.hash(dados.senha, 10);

        return await salvarRegistro(this.tabela, dados);
    }

    async listarUsuarios() {
        return await consultarDados(this.tabela);
    }

    async obterUsuarioPorId(id: number) {
        return await buscarPorId(this.tabela, id);
    }

    /**
     * Busca usuários pelo e-mail (parcialmente, usando LIKE).
     */
    async obterUsuariosPorEmail(emailTermo: string) {
        const termo = `%${emailTermo}%`;
        const usuarios: any = await executarQuery(`SELECT * FROM ${this.tabela} WHERE email LIKE ?`, [termo]);
        return { total: usuarios.length, usuarios };
    }

    /**
     * Atualiza um usuário e recriptografa a senha se for alterada.
     */
    async atualizarUsuario(id: number, dados: { nome?: string; email?: string; senha?: string }) {
        const usuario = await buscarPorId(this.tabela, id);
        if ('erro' in usuario) return usuario;

        if (dados.senha) {
            dados.senha = await bcrypt.hash(dados.senha, 10);
        }

        return await atualizarRegistro(this.tabela, id, dados);
    }

    async excluirUsuario(id: number) {
        return await excluirRegistro(this.tabela, id);
    }
}

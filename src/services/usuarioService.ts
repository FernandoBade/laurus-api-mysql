import { NomeDaTabela } from '../utils/enums';
import bcrypt from 'bcrypt';
import { executarQuery } from '../utils/db'
import {
    buscarPorId,
    salvarRegistro,
    atualizarRegistro,
    excluirRegistro,
    consultarDados
} from '../utils/commons';

export class UsuarioService {
    private tabela = NomeDaTabela.USUARIO;
    /**
     * Cria um novo usuário garantindo que o e-mail seja único e criptografando a senha.
     * @param dados - Dados do usuário a ser criado.
     * @returns Retorna o usuário criado ou um erro se o e-mail já estiver em uso.
     */
    async criarUsuario(dados: { nome: string; sobrenome: string; email: string; senha: string; }) {
        dados.email = dados.email.trim().toLowerCase();

        const usuarios = await consultarDados(this.tabela, 'email', dados.email);
        if (usuarios.length > 0) {
            return { erro: 'O e-mail já está em uso' };
        }

        dados.senha = await bcrypt.hash(dados.senha, 10);
        const novoUsuario = await salvarRegistro(this.tabela, dados);

        const usuarioCompleto = await buscarPorId(this.tabela, novoUsuario.id);
        return usuarioCompleto;
    }

    /**
     * Lista todos os usuários cadastrados.
     * @returns Retorna um array de usuários.
     */
    async listarUsuarios() {
        const usuarios = await consultarDados(this.tabela);
        return { total: usuarios.length, usuarios };
    }

    /**
     * Obtém um usuário pelo ID.
     * @param id - ID do usuário.
     * @returns Retorna o usuário encontrado ou um erro caso não exista.
     */
    async obterUsuarioPorId(id: number) {
        const usuario = await buscarPorId(this.tabela, id);
        return 'erro' in usuario ? { erro: 'Usuário não encontrado' } : usuario;
    }

    /**
     * Busca usuários pelo e-mail (parcialmente, usando LIKE).
     * @param emailTermo - Termo de busca para o e-mail.
     * @returns Retorna uma lista de usuários que correspondem ao termo de busca.
     */
    async obterUsuariosPorEmail(emailTermo: string) {
        const termo = `%${emailTermo}%`;
        const usuarios: any = await executarQuery(`SELECT * FROM ${this.tabela} WHERE email LIKE ?`, [termo]);
        return { total: usuarios.length, usuarios };
    }

    /**
     * Atualiza um usuário pelo ID e recriptografa a senha se for alterada.
     * @param id - ID do usuário a ser atualizado.
     * @param dados - Dados a serem atualizados.
     * @returns Retorna o usuário atualizado ou um erro caso não seja encontrado.
     */
    async atualizarUsuario(id: number, dados: any) {
        const usuario = await buscarPorId(this.tabela, id);
        if ('erro' in usuario) {
            return { erro: 'Usuário não encontrado' };
        }

        if (dados.senha) {
            dados.senha = await bcrypt.hash(dados.senha, 10);
        }

        await atualizarRegistro(this.tabela, id, dados);
        const usuarioAtualizado = await buscarPorId(this.tabela, id);

        return usuarioAtualizado;
    }
    /**
     * Exclui um usuário pelo ID.
     * @param id - ID do usuário a ser excluído.
     * @returns Retorna o ID do usuário excluído ou um erro caso não seja encontrado.
     */
    async excluirUsuario(id: number) {
        const usuario = await buscarPorId(this.tabela, id);
        if ('erro' in usuario) {
            return { erro: 'Usuário não encontrado' };
        }

        await excluirRegistro(this.tabela, id);
        return { id };
    }
}

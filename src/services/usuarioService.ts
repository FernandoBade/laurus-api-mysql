// services/usuarioService.ts
import { executarQuery } from '../utils/db';
import bcrypt from 'bcrypt';

export class UsuarioService {
    static async criarUsuario(dados: { nome: string; sobrenome: string; email: string; senha: string; dataNascimento?: string }) {
        dados.email = dados.email.trim().toLowerCase();

        const usuarios: any = await executarQuery("SELECT * FROM Usuario WHERE email = ?", [dados.email]);
        if (usuarios.length > 0) {
            return { erro: 'O e-mail já está em uso' };
        }

        const senhaCrypto = await bcrypt.hash(dados.senha, 10);
        const dataNascimento = dados.dataNascimento ? new Date(dados.dataNascimento) : null;

        const resultado: any = await executarQuery(
            "INSERT INTO Usuario (nome, sobrenome, email, senha, dataNascimento) VALUES (?, ?, ?, ?, ?)",
            [dados.nome, dados.sobrenome, dados.email, senhaCrypto, dataNascimento]
        );

        const insertId = resultado.insertId;
        return { id: insertId, ...dados, senha: senhaCrypto, dataNascimento };
    }

    static async listarUsuarios() {
        return await executarQuery("SELECT * FROM Usuario");
    }

    static async obterUsuarioPorId(id: string) {
        const usuarios: any = await executarQuery("SELECT * FROM Usuario WHERE id = ?", [id]);
        if (usuarios.length === 0) {
            return { erro: "Usuário não encontrado" };
        }
        return usuarios[0];
    }

    static async obterUsuariosPorEmail(emailTermo: string) {
        const termo = `%${emailTermo}%`;
        const usuarios: any = await executarQuery("SELECT * FROM Usuario WHERE email LIKE ?", [termo]);
        return { total: usuarios.length, usuarios };
    }

    static async atualizarUsuario(id: string, dadosParaAtualizar: { nome?: string; email?: string; senha?: string }) {
        const usuarios: any = await executarQuery("SELECT * FROM Usuario WHERE id = ?", [id]);
        if (usuarios.length === 0) {
            return { erro: "Usuário não encontrado" };
        }

        if (dadosParaAtualizar.senha) {
            dadosParaAtualizar.senha = await bcrypt.hash(dadosParaAtualizar.senha, 10);
        }

        const campos = [];
        const valores = [];

        for (const key of Object.keys(dadosParaAtualizar) as (keyof typeof dadosParaAtualizar)[]) {
            campos.push(`${key} = ?`);
            valores.push(dadosParaAtualizar[key]);
        }
        valores.push(id);

        const query = `UPDATE Usuario SET ${campos.join(', ')} WHERE id = ?`;

        await executarQuery(query, valores);

        const usuarioAtualizado: any = await executarQuery("SELECT * FROM Usuario WHERE id = ?", [id]);
        return usuarioAtualizado[0];
    }

    static async excluirUsuario(id: string) {
        const usuarios: any = await executarQuery("SELECT * FROM Usuario WHERE id = ?", [id]);
        if (usuarios.length === 0) {
            return { erro: "Usuário não encontrado" };
        }
        await executarQuery("DELETE FROM Usuario WHERE id = ?", [id]);
        return { id };
    }
}

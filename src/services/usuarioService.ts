import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class UsuarioService {
    static async criarUsuario(dados: { nome: string; sobrenome: string; email: string; senha: string; dataNascimento?: string }) {
        dados.email = dados.email.trim().toLowerCase();

        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email: dados.email },
        });

        if (usuarioExistente) {
            return { erro: 'O e-mail já está em uso' };
        }

        const senhaCrypto = await bcrypt.hash(dados.senha, 10);
        const dataNascimento = dados.dataNascimento ? new Date(dados.dataNascimento) : undefined;

        return prisma.usuario.create({
            data: {
                ...dados,
                senha: senhaCrypto,
                dataNascimento,
            },
        });
    }

    static listarUsuarios() {
        return prisma.usuario.findMany();
    }

    static async obterUsuarioPorId(id: string) {
        const usuario = await prisma.usuario.findUnique({ where: { id } });
        if (!usuario) {
            return { erro: "Usuário não encontrado" };
        }
        return usuario;
    }

    static async obterUsuariosPorEmail(emailTermo?: string) {
        const usuarios = await prisma.usuario.findMany({
            where: { email: { contains: emailTermo } },
        });

        return { total: usuarios.length, usuarios };
    }

    static async atualizarUsuario(id: string, dadosParaAtualizar: { nome?: string; email?: string; senha?: string }) {
        const usuarioExistente = await prisma.usuario.findUnique({ where: { id } });

        if (!usuarioExistente) {
            return { erro: "Usuário não encontrado" }
        }

        return prisma.usuario.update({
            where: { id },
            data: dadosParaAtualizar,
        });
    }

    static async excluirUsuario(id: string) {
        const usuarioExistente = await prisma.usuario.findUnique({ where: { id } });

        if (!usuarioExistente) {
            return { erro: "Usuário não encontrado" }
        }

        await prisma.usuario.delete({ where: { id } });

        return { id };
    }
}

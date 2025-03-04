import { Router, Request, Response, NextFunction } from 'express';
import { TiposDeLog, Operacoes, CategoriasDeLog } from '../utilidades/enumeradores';
import { registrarLog } from '../utilidades/metodosGerais';
import UsuarioControle from '../controles/usuarioControle';
const roteamento = Router();

roteamento.get('/buscar', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UsuarioControle.obterUsuariosPorEmail(req, res, next);
    } catch (erro) {
        await registrarLog(
            TiposDeLog.DEBUG,
            Operacoes.BUSCA,
            CategoriasDeLog.USUARIO,
            JSON.stringify(erro),
            undefined,
            next
        );
    }
});

roteamento.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        UsuarioControle.criarUsuario(req, res, next);
    } catch (erro) {
        await registrarLog(
            TiposDeLog.DEBUG,
            Operacoes.CRIACAO,
            CategoriasDeLog.USUARIO,
            JSON.stringify(erro),
            req.body?.usuarioId,
            next
        );
    }
});


roteamento.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UsuarioControle.obterUsuarioPorId(req, res, next);
    } catch (erro) {
        await registrarLog(
            TiposDeLog.DEBUG,
            Operacoes.BUSCA,
            CategoriasDeLog.USUARIO,
            JSON.stringify(erro),
            req.params.id ? Number(req.params.id) : undefined,
            next
        );
    }
});

roteamento.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UsuarioControle.listarUsuarios(req, res, next);
    } catch (erro) {
        await registrarLog(
            TiposDeLog.DEBUG,
            Operacoes.BUSCA,
            CategoriasDeLog.USUARIO,
            JSON.stringify(erro),
            undefined,
            next
        );
    }
});

roteamento.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UsuarioControle.atualizarUsuario(req, res, next);
    } catch (erro) {
        await registrarLog(
            TiposDeLog.DEBUG,
            Operacoes.ATUALIZACAO,
            CategoriasDeLog.USUARIO,
            JSON.stringify(erro),
            req.params.id ? Number(req.params.id) : undefined,
            next
        );
    }
});

roteamento.delete('/:id?', async (req: Request, res: Response, next: NextFunction) => {
    try {
        UsuarioControle.excluirUsuario(req, res, next);
    } catch (erro) {
        await registrarLog(
            TiposDeLog.DEBUG,
            Operacoes.EXCLUSAO,
            CategoriasDeLog.USUARIO,
            JSON.stringify(erro),
            req.params.id ? Number(req.params.id) : undefined,
            next
        );
    }
});

export default roteamento;

import { Router, Request, Response, NextFunction } from 'express';
import { TiposDeLog, Operacoes, CategoriasDeLog } from '../utils/enums';
import { registrarLog } from '../utils/commons';
import UsuarioController from '../controllers/usuarioController';
const router = Router();

router.get('/buscar', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UsuarioController.obterUsuariosPorEmail(req, res, next);
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

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        UsuarioController.criarUsuario(req, res, next);
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


router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UsuarioController.obterUsuarioPorId(req, res, next);
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

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UsuarioController.listarUsuarios(req, res, next);
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

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await UsuarioController.atualizarUsuario(req, res, next);
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

router.delete('/:id?', async (req: Request, res: Response, next: NextFunction) => {
    try {
        UsuarioController.excluirUsuario(req, res, next);
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

export default router;

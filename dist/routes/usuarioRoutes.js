"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuarioController_1 = __importDefault(require("../controllers/usuarioController"));
const router = (0, express_1.Router)();
router.post('/', (req, res, next) => {
    usuarioController_1.default.cadastrarUsuario(req, res, next);
});
router.get('/:id', (req, res, next) => {
    usuarioController_1.default.obterUsuarioPorId(req, res, next);
});
router.get('/:email', (req, res, next) => {
    usuarioController_1.default.obterUsuariosPorEmail(req, res, next);
});
router.put('/:id', (req, res, next) => {
    usuarioController_1.default.atualizarUsuario(req, res, next);
});
router.delete('/:id', (req, res, next) => {
    usuarioController_1.default.excluirUsuario(req, res, next);
});
router.get('/', (req, res, next) => {
    usuarioController_1.default.listarUsuarios(req, res, next);
});
exports.default = router;

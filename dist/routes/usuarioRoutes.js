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
const express_1 = require("express");
const enums_1 = require("../utils/enums");
const commons_1 = require("../utils/commons");
const usuarioController_1 = __importDefault(require("../controllers/usuarioController"));
const router = (0, express_1.Router)();
router.get('/buscar', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield usuarioController_1.default.obterUsuariosPorEmail(req, res, next);
    }
    catch (erro) {
        yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.DEBUG, enums_1.Operacoes.BUSCA, enums_1.CategoriasDeLog.USUARIO, JSON.stringify(erro), undefined, next);
    }
}));
router.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        usuarioController_1.default.criarUsuario(req, res, next);
    }
    catch (erro) {
        yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.DEBUG, enums_1.Operacoes.CRIACAO, enums_1.CategoriasDeLog.USUARIO, JSON.stringify(erro), (_a = req.body) === null || _a === void 0 ? void 0 : _a.usuarioId, next);
    }
}));
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield usuarioController_1.default.obterUsuarioPorId(req, res, next);
    }
    catch (erro) {
        yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.DEBUG, enums_1.Operacoes.BUSCA, enums_1.CategoriasDeLog.USUARIO, JSON.stringify(erro), req.params.id ? Number(req.params.id) : undefined, next);
    }
}));
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield usuarioController_1.default.listarUsuarios(req, res, next);
    }
    catch (erro) {
        yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.DEBUG, enums_1.Operacoes.BUSCA, enums_1.CategoriasDeLog.USUARIO, JSON.stringify(erro), undefined, next);
    }
}));
router.put('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield usuarioController_1.default.atualizarUsuario(req, res, next);
    }
    catch (erro) {
        yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.DEBUG, enums_1.Operacoes.ATUALIZACAO, enums_1.CategoriasDeLog.USUARIO, JSON.stringify(erro), req.params.id ? Number(req.params.id) : undefined, next);
    }
}));
router.delete('/:id?', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        usuarioController_1.default.excluirUsuario(req, res, next);
    }
    catch (erro) {
        yield (0, commons_1.registrarLog)(enums_1.TiposDeLog.DEBUG, enums_1.Operacoes.EXCLUSAO, enums_1.CategoriasDeLog.USUARIO, JSON.stringify(erro), req.params.id ? Number(req.params.id) : undefined, next);
    }
}));
exports.default = router;

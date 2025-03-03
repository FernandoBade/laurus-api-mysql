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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogService = void 0;
const enums_1 = require("../utils/enums");
const commons_1 = require("../utils/commons");
const commons_2 = require("../utils/commons");
class LogService {
    static registrarLog(tipo, operacao, categoria, detalhe, usuarioId) {
        return __awaiter(this, void 0, void 0, function* () {
            let usuario = null;
            if (usuarioId && !isNaN(usuarioId)) {
                const usuarioEncontrado = yield (0, commons_1.buscarPorId)(enums_1.NomeDaTabela.USUARIO, usuarioId);
                if (!('erro' in usuarioEncontrado)) {
                    usuario = usuarioEncontrado;
                }
            }
            if (tipo !== enums_1.TiposDeLog.DEBUG) {
                yield (0, commons_1.salvarRegistro)(this.tabela, {
                    tipo,
                    operacao,
                    detalhe,
                    categoria,
                    usuarioId: usuario ? usuario.id : null,
                    timestamp: new Date(),
                });
            }
        });
    }
    static esvaziarLogsAntigos() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - 120);
            const dataLimiteFormatada = dataLimite.toISOString().slice(0, 19).replace('T', ' ');
            const resultado = yield (0, commons_1.executarQuery)(`DELETE FROM ${this.tabela} WHERE timestamp < ?`, [dataLimiteFormatada]);
            const total = (_a = resultado.affectedRows) !== null && _a !== void 0 ? _a : 0;
            yield (0, commons_2.registrarLog)(enums_1.TiposDeLog.INFO, enums_1.Operacoes.EXCLUSAO, enums_1.CategoriasDeLog.LOG, `Total de logs deletados: ${total}`);
            return total;
        });
    }
    static buscarLogsPorUsuario(usuarioId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (isNaN(usuarioId))
                throw new Error("ID de usuário inválido");
            return yield (0, commons_1.consultarDados)(this.tabela, "usuarioId", usuarioId);
        });
    }
}
exports.LogService = LogService;
LogService.tabela = enums_1.NomeDaTabela.LOG;

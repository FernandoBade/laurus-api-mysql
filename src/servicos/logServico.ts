import { NomeDaTabela, TiposDeLog, Operacoes, CategoriasDeLog } from '../uteis/enumeradores';
import { buscarPorId, salvarRegistro, executarQuery, consultarDados } from '../uteis/metodosGerais';
import { registrarLog } from '../uteis/metodosGerais';

export class LogServico {
    private static readonly tabela = NomeDaTabela.LOG;

    static async registrarLog(
        tipo: TiposDeLog,
        operacao: Operacoes,
        categoria: CategoriasDeLog,
        detalhe: string,
        usuarioId?: number
    ) {
        let usuario = null;

        if (usuarioId && !isNaN(usuarioId)) {
            const usuarioEncontrado = await buscarPorId(NomeDaTabela.USUARIO, usuarioId);
            if (!('erro' in usuarioEncontrado)) {
                usuario = usuarioEncontrado;
            }
        }

        if (tipo !== TiposDeLog.DEBUG) {
            await salvarRegistro(this.tabela, {
                tipo,
                operacao,
                detalhe,
                categoria,
                usuarioId: usuario ? usuario.id : null,
                timestamp: new Date(),
            });
        }
    }

    static async esvaziarLogsAntigos() {
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - 120);
        const dataLimiteFormatada = dataLimite.toISOString().slice(0, 19).replace('T', ' ');

        const resultado: any = await executarQuery(
            `DELETE FROM ${this.tabela} WHERE timestamp < ?`,
            [dataLimiteFormatada]
        );

        const total = resultado.affectedRows ?? 0;

        await registrarLog(
            TiposDeLog.DEBUG,
            Operacoes.EXCLUSAO,
            CategoriasDeLog.LOG,
            `Total de logs deletados: ${total}`
        );

        return total;
    }

    static async buscarLogsPorUsuario(usuarioId: number) {
        if (isNaN(usuarioId)) throw new Error("ID de usuário inválido");
        return await consultarDados(this.tabela, "usuarioId", usuarioId);
    }
}
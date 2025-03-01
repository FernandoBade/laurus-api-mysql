import { NomeDaTabela } from '../utils/enums';
import { buscarPorId, salvarRegistro, executarQuery, excluirRegistro, consultarDados } from '../utils/commons';
import { TiposDeLog, Operacoes, CategoriasDeLog } from '../utils/enums';
import { registrarLog } from '../utils/commons';

export class LogService {
  static async registrarLog(
    tipo: TiposDeLog,
    operacao: Operacoes,
    categoria: CategoriasDeLog,
    detalhe: string,
    usuarioId?: string
  ) {
    let usuario = null;

    if (usuarioId) {
      const usuarioEncontrado = await buscarPorId(NomeDaTabela.USUARIO, Number(usuarioId));
      if (!('erro' in usuarioEncontrado)) {
        usuario = usuarioEncontrado;
      }
    }

    if (tipo !== TiposDeLog.DEBUG) {
      await salvarRegistro(NomeDaTabela.LOG, {
        tipo,
        operacao,
        detalhe,
        categoria,
        usuarioId: usuario ? usuario.id : null,
        timestamp: new Date(), // MySQL salvará corretamente
      });
    }
  }

  /**
   * Remove logs mais antigos que 120 dias.
   * @returns O número de registros excluídos.
   */
  static async esvaziarLogsAntigos() {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 120);
    const dataLimiteFormatada = dataLimite.toISOString().slice(0, 19).replace('T', ' ');

    // Exclui diretamente os logs antigos com a query
    const resultado: any = await executarQuery(
      `DELETE FROM ${NomeDaTabela.LOG} WHERE timestamp < ?`,
      [dataLimiteFormatada]
    );

    const total = resultado.affectedRows ?? 0;

    await registrarLog(
      TiposDeLog.INFO,
      Operacoes.EXCLUSAO,
      CategoriasDeLog.LOG,
      `Total de logs deletados: ${total}`
    );

    return total;
  }

  /**
   * Busca logs de um usuário específico.
   * @param usuarioId - ID do usuário.
   * @returns Lista de logs encontrados.
   */
  static async buscarLogsPorUsuario(usuarioId: string) {
    return await consultarDados(NomeDaTabela.LOG, "usuarioId", usuarioId);
  }
}


import { executarQuery } from '../utils/db';
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
      const usuarios: any = await executarQuery("SELECT * FROM Usuario WHERE id = ?", [usuarioId]);
      if (usuarios.length > 0) {
        usuario = usuarios[0];
      }
    }

    if (tipo !== TiposDeLog.DEBUG) {
      await executarQuery(
        "INSERT INTO Log (tipo, operacao, detalhe, categoria, usuarioId, timestamp) VALUES (?, ?, ?, ?, ?, NOW())",
        [tipo, operacao, detalhe, categoria, usuario ? usuario.id : null]
      );
    }
  }

  static async esvaziarLogsAntigos() {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 120);
    const dataLimiteFormatted = dataLimite.toISOString().slice(0, 19).replace('T', ' ');

    const resultado: any = await executarQuery(
      "DELETE FROM Log WHERE timestamp < ?",
      [dataLimiteFormatted]
    );

    const count = resultado.affectedRows ?? 0;

    await registrarLog(
      TiposDeLog.INFO,
      Operacoes.EXCLUSAO,
      CategoriasDeLog.LOG,
      `Total de logs deletados: ${count}`
    );
    return count;
  }

  static async buscarLogsPorUsuario(usuarioId: string) {
    const logs: any = await executarQuery(
      "SELECT * FROM Log WHERE usuarioId = ? ORDER BY timestamp DESC",
      [usuarioId]
    );
    return logs;
  }
}

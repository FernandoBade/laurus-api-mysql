import { executeMigrationGroup } from "./utils/database/migrations/dbMigrations";
import { LogType, LogOperation, Operator, LogCategory, TableName } from "./utils/enum";
import { LogService } from "../src/service/logService";
import Log from "./model/log/log";
import User from "./model/user/user";

import { findWithColumnFilters } from "./utils/database/helpers/dbHelpers";
//executeMigrationGroup(9, Operation.ROLLBACK);

// Create an instance of LogService for testing purposes
const logService = new LogService();

// async function testarBuscaLogs() {
//     const resultado = await findWithColumnFilters<Log>('log', {
//       // Busca logs do tipo "error"
//       type: { operator: Operator.EQUAL, value: LogType.SUCCESS },

//       // Filtro por múltiplas categorias
//       category: { operator: Operator.IN, value: [LogCategory.MIGRATION]},

//       // Busca por trecho no campo "detail"
//       //detail: { operator: Operator.LIKE, value: 'JWT' },

//       // Entre duas datas
//       timestamp: {
//         operator: Operator.BETWEEN,
//         value: [new Date('2025-01-01'), new Date('2025-12-31')],
//       },
//     }, {
//       orderBy: 'timestamp',
//       direction: Operator.DESC,
//       limit: 10,
//       offset: 0,
//     });

//     if (!resultado.success) {
//       console.error('Erro na busca:', resultado.error);
//       return;
//     }

//     console.log('Registros encontrados:', resultado.data?.length);
//     console.log(resultado.data);
// }

async function testarBuscaDeUsuarios() {
    try {
      const resultado = await findWithColumnFilters<User>(TableName.USER, {
        firstName: { operator: Operator.EQUAL, value: 'Pepe' },
        lastName: { operator: Operator.EQUAL, value: 'Silva' },
      }, {
        orderBy: 'id',
        direction: Operator.ASC,
      });

      if (!resultado.success) {
        console.error('Erro na busca:', resultado.error);
        return;
      }

      console.log('Registros encontrados:', resultado.data?.length);
      console.log(resultado.data);
    } catch (err) {
      console.error('Erro inesperado ao buscar usuários:', err);
    } finally {
      console.log('Consulta finalizada.');
      // Só use isso abaixo em scripts isolados, NUNCA em produção:
      // process.exit(0);
    }
  }


testarBuscaDeUsuarios();
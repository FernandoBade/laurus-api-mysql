
import { executeMigrationGroup } from "./utils/database/migrations/dbMigrations";
import { Operation } from "./utils/enum";
import { LogService } from "../src/service/logService";
//executeMigrationGroup(9, Operation.ROLLBACK);

const logService = new LogService();
logService.deleteOldLogs();

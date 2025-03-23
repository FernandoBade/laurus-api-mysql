
import { executeMigrationGroup } from "./utils/database/dbMigrations";
import { Operation } from "./utils/enum";

executeMigrationGroup(4, Operation.APPLY);

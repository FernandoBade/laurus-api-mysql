import { TableName } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';

/**
 * Service to manage refresh tokens in the database,
 * extending base CRUD operations from DbService.
 */
export class RefreshTokenService extends DbService {
    constructor() {
        super(TableName.REFRESH_TOKEN);
    }
}

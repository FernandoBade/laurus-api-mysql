import { TableName } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';

/**
 * Service for managing refresh token operations in the database.
 * Extends base CRUD functionality from DbService.
 */
export class RefreshTokenService extends DbService {
    constructor() {
        super(TableName.REFRESH_TOKEN);
    }
}

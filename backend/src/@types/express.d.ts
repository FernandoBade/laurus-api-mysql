import 'express-serve-static-core';
import { LanguageCode } from '../../../shared/i18n/resourceTypes';
import { Profile } from '../../../shared/enums/user.enums';

declare module 'express-serve-static-core' {
    interface Request {
        language?: LanguageCode;
        user?: {
            id: number;
            profile?: Profile;
        };
        file?: Express.Multer.File;
        files?: Express.Multer.File[];
    }
}

export { };

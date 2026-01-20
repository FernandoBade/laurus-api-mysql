import 'express-serve-static-core';
import { LanguageCode } from '../../../shared/i18n/resourceTypes';

declare module 'express-serve-static-core' {
  interface Request {
    language?: LanguageCode;
    user?: {
      id: number;
    };
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
  }
}

export {};

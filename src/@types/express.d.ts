import 'express-serve-static-core';
import { LanguageCode } from '../utils/resources/resourceTypes';

declare module 'express-serve-static-core' {
  interface Request {
    language?: LanguageCode;
    user?: {
      id: number;
    };
  }
}

export {};

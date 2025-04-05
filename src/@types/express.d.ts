import { LanguageCode } from "../utils/resources/resourceTypes";

declare global {
    namespace Express {
        interface Request {
            language?: LanguageCode;
        }
    }
}

export { };

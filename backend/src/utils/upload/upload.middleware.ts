import multer from 'multer';
import { Request, Response } from 'express';
import { HTTPStatus } from '../../../../shared/enums/http-status.enums';
import { MulterErrorCode } from '../../../../shared/enums/upload.enums';
import { ResourceKey as Resource } from '../../../../shared/i18n/resource.keys';
import { LanguageCode } from '../../../../shared/i18n/resourceTypes';
import { translateResourceWithParams } from '../../../../shared/i18n/resource.utils';
import { answerAPI } from '../commons';
import { createValidationError } from '../validation/errors';
import { UploadValidation } from './upload.constants';

export interface MulterUploadErrorConfig {
    defaultFieldName: string;
    invalidTypeExpected: string;
}

/**
 * @summary Converts Multer upload failures into standardized validation responses.
 */

export function handleMulterUploadError(
    req: Request,
    res: Response,
    error: unknown,
    config: MulterUploadErrorConfig
): boolean {
    const language = req.language as LanguageCode;

    if (error instanceof multer.MulterError) {
        const fieldName = error.field ?? config.defaultFieldName;

        if (error.code === MulterErrorCode.LIMIT_FILE_SIZE) {
            const errors = [
                createValidationError(fieldName, translateResourceWithParams(Resource.INVALID_TYPE, language, {
                    path: fieldName,
                    expected: UploadValidation.FILE_SIZE_EXPECTED,
                    received: UploadValidation.FILE_SIZE_EXCEEDED,
                }))
            ];
            answerAPI(req, res, HTTPStatus.BAD_REQUEST, errors, Resource.VALIDATION_ERROR);
            return true;
        }

        const errors = [
            createValidationError(fieldName, translateResourceWithParams(Resource.INVALID_TYPE, language, {
                path: fieldName,
                expected: config.invalidTypeExpected,
                received: error.field ?? error.code,
            }))
        ];
        answerAPI(req, res, HTTPStatus.BAD_REQUEST, errors, Resource.VALIDATION_ERROR);
        return true;
    }

    if (error) {
        answerAPI(req, res, HTTPStatus.BAD_REQUEST, undefined, Resource.INVALID_TYPE);
        return true;
    }

    return false;
}

import multer from 'multer';
import { HTTPStatus } from '../../../../shared/enums/http-status.enums';
import { Language } from '../../../../shared/enums/language.enums';
import { ResourceKey as Resource } from '../../../../shared/i18n/resource.keys';
import { translateResource } from '../../../../shared/i18n/resource.utils';
import { createMockRequest, createMockResponse } from '../../helpers/mockExpress';
import { UploadValidation } from '../../../src/utils/upload/upload.constants';
import { handleMulterUploadError } from '../../../src/utils/upload/upload.middleware';

describe('upload.middleware', () => {
    it('handles LIMIT_FILE_SIZE errors using default field name when multer field is missing', () => {
        const req = createMockRequest({ language: Language.EN_US });
        const res = createMockResponse();
        const error = new multer.MulterError('LIMIT_FILE_SIZE');

        const handled = handleMulterUploadError(req, res, error, {
            defaultFieldName: 'avatar',
            invalidTypeExpected: UploadValidation.AVATAR_FILE_EXPECTED,
        });

        expect(handled).toBe(true);
        expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: translateResource(Resource.VALIDATION_ERROR, Language.EN_US),
            error: expect.arrayContaining([
                expect.objectContaining({
                    property: 'avatar',
                    error: expect.any(String),
                }),
            ]),
        }));
    });

    it('handles non-size multer errors using code as received value when field is absent', () => {
        const req = createMockRequest({ language: Language.EN_US });
        const res = createMockResponse();
        const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE');

        const handled = handleMulterUploadError(req, res, error, {
            defaultFieldName: 'attachment',
            invalidTypeExpected: UploadValidation.FEEDBACK_ATTACHMENT_EXPECTED,
        });

        expect(handled).toBe(true);
        expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: translateResource(Resource.VALIDATION_ERROR, Language.EN_US),
            error: expect.arrayContaining([
                expect.objectContaining({
                    property: 'attachment',
                    error: expect.any(String),
                }),
            ]),
        }));
    });

    it('handles generic upload errors as INVALID_TYPE', () => {
        const req = createMockRequest({ language: Language.EN_US });
        const res = createMockResponse();

        const handled = handleMulterUploadError(
            req,
            res,
            new Error('unexpected upload failure'),
            {
                defaultFieldName: 'avatar',
                invalidTypeExpected: UploadValidation.AVATAR_FILE_EXPECTED,
            }
        );

        expect(handled).toBe(true);
        expect(res.status).toHaveBeenCalledWith(HTTPStatus.BAD_REQUEST);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: translateResource(Resource.INVALID_TYPE, Language.EN_US),
        }));
    });

    it('returns false when there is no upload error to handle', () => {
        const req = createMockRequest({ language: Language.EN_US });
        const res = createMockResponse();

        const handled = handleMulterUploadError(req, res, undefined, {
            defaultFieldName: 'avatar',
            invalidTypeExpected: UploadValidation.AVATAR_FILE_EXPECTED,
        });

        expect(handled).toBe(false);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});

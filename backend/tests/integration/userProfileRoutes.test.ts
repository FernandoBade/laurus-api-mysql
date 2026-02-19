import express from 'express';
import request from 'supertest';
import userRoutes from '../../src/routes/userRoutes';
import { UserService } from '../../src/service/userService';
import * as commons from '../../src/utils/commons';
import { makeSanitizedUser, makeUser } from '../helpers/factories';
import { Language } from '../../../shared/enums/language.enums';

jest.mock('../../src/utils/auth/verifyToken', () => ({
    verifyToken: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
        req.user = { id: 1 };
        next();
    },
}));

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
        req.language = Language.EN_US;
        next();
    });
    app.use('/users', userRoutes);
    return app;
};

describe('User routes integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(commons, 'createLog').mockResolvedValue();
    });

    it('updates user profile via PUT /users/:id', async () => {
        const existing = makeUser({ id: 1 });
        const updated = makeSanitizedUser({ id: 1, firstName: 'Jane', email: 'jane@example.com' });
        jest.spyOn(UserService.prototype, 'findOne').mockResolvedValue({ success: true, data: existing });
        jest.spyOn(UserService.prototype, 'updateUser').mockResolvedValue({ success: true, data: updated });

        const app = buildApp();
        const response = await request(app)
            .put('/users/1')
            .send({ firstName: 'Jane', email: 'jane@example.com' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                data: expect.objectContaining({ id: 1, firstName: 'Jane', email: 'jane@example.com' }),
            })
        );
    });

    it('uploads avatar via POST /users/upload/avatar', async () => {
        const payload = { url: 'https://bade.digital/zinero/users/1/avatar/avatar.jpg' };
        jest.spyOn(UserService.prototype, 'uploadAvatar').mockResolvedValue({ success: true, data: payload });

        const app = buildApp();
        const response = await request(app)
            .post('/users/upload/avatar')
            .attach('avatar', Buffer.from('avatar-bytes'), 'avatar.jpg');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                data: payload,
            })
        );
    });
});

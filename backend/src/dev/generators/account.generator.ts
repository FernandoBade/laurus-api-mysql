import AccountController from '../../controller/accountController';
import type { AccountEntity } from '../../../../shared/domains/account/account.types';
import { AccountType } from '../../../../shared/enums';
import { SeedContext, executeController } from '../seed.utils';

type AccountRequestBody = {
    name: string;
    institution: string;
    type: AccountType;
    observation?: string;
    userId: number;
    active?: boolean;
};

/**
 * Creates accounts for a user using the AccountController.
 *
 * @summary Generates and persists financial accounts for a user.
 */
export async function createAccounts(context: SeedContext, userId: number): Promise<AccountEntity[]> {
    const count = context.random.int(context.config.accountsPerUser.min, context.config.accountsPerUser.max);
    const templates = context.random.pickMany(context.config.accountTemplates, count);
    const accounts: AccountEntity[] = [];

    for (let i = 0; i < count; i += 1) {
        const template = templates[i % templates.length];
        const institution = context.random.pickOne(context.config.institutions);
        const observation = context.random.chance(0.7) ? template.observation : undefined;

        const body: AccountRequestBody = {
            name: template.name,
            institution,
            type: template.type,
            ...(observation ? { observation } : {}),
            userId,
            active: true,
        };

        const created = await executeController<AccountEntity>(AccountController.createAccount, {
            body,
            language: context.language,
            userId,
        });
        accounts.push(created);
    }

    return accounts;
}

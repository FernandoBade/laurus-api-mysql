import CreditCardController from '../../controller/creditCardController';
import type { AccountEntity } from '../../../../shared/domains/account/account.types';
import type { CreditCardEntity } from '../../../../shared/domains/creditCard/creditCard.types';
import { CreditCardFlag } from '../../../../shared/enums/creditCard.enums';
import { SeedContext, executeController, roundCurrency } from '../seed.utils';

type CreditCardRequestBody = {
    name: string;
    flag: CreditCardFlag;
    observation?: string;
    limit?: string;
    userId: number;
    accountId?: number;
    active?: boolean;
};

/**
 * Creates credit cards for a user using the CreditCardController.
 *
 * @summary Generates and persists credit cards for a user.
 */
export async function createCreditCards(
    context: SeedContext,
    userId: number,
    accounts: AccountEntity[]
): Promise<CreditCardEntity[]> {
    const maxCards = context.config.creditCardsPerUser.max;
    const minCards = context.config.creditCardsPerUser.min;
    const count = context.random.int(minCards, maxCards);
    if (count === 0) {
        return [];
    }

    const products = context.random.pickMany(context.config.creditCardProducts, count);
    const shuffledAccounts = context.random.shuffle(accounts);
    const cards: CreditCardEntity[] = [];
    let accountIndex = 0;

    for (const product of products) {
        const shouldLinkAccount = shuffledAccounts.length > 0 && context.random.chance(0.6) && accountIndex < shuffledAccounts.length;
        const accountId = shouldLinkAccount ? shuffledAccounts[accountIndex++].id : undefined;
        const observation = context.random.chance(0.8) ? product.observation : undefined;
        const limit = roundCurrency(context.random.float(context.config.creditCardLimitRange.min, context.config.creditCardLimitRange.max)).toFixed(2);

        const body: CreditCardRequestBody = {
            name: product.name,
            flag: product.flag,
            ...(observation ? { observation } : {}),
            limit,
            userId,
            ...(accountId ? { accountId } : {}),
            active: true,
        };

        const created = await executeController<CreditCardEntity>(CreditCardController.createCreditCard, {
            body,
            language: context.language,
            userId,
        });
        cards.push(created);
    }

    return cards;
}

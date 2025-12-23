import { AccountType, CategoryColor, CategoryType, CreditCardFlag, Currency, DateFormat, Language, Profile, Theme } from '../utils/enum';
import { LanguageCode } from '../utils/resources/resourceTypes';

export type AccountTemplate = {
    name: string;
    type: AccountType;
    observation?: string;
};

export type CreditCardProduct = {
    name: string;
    flag: CreditCardFlag;
    observation?: string;
};

export type CategoryTemplate = {
    name: string;
    type: CategoryType;
    color: CategoryColor;
    subcategories: string[];
    amountRange: { min: number; max: number };
    merchants: string[];
    observationTemplates: string[];
    recurringChance?: number;
    installmentChance?: number;
};

export type SeedConfig = {
    language: LanguageCode;
    defaultPassword: string;
    emailDomain: string;
    userOptions: {
        themes: Theme[];
        languages: Language[];
        currencies: Currency[];
        dateFormats: DateFormat[];
        profiles: Profile[];
        phoneChance: number;
        birthDateChance: number;
        activeChance: number;
    };
    accountsPerUser: { min: number; max: number };
    creditCardsPerUser: { min: number; max: number };
    transactionsPerUser: { min: number; max: number };
    transactionDistribution: {
        creditCardShare: { min: number; max: number };
        minCreditCardTransactions: number;
        incomeShare: { min: number; max: number };
        minIncomeTransactions: number;
        observationChance: number;
        subcategoryChance: number;
    };
    recurringDefaults: {
        chance: number;
        minDay: number;
        maxDay: number;
    };
    installmentDefaults: {
        chance: number;
        minMonths: number;
        maxMonths: number;
    };
    dateRangeYears: number;
    firstNames: string[];
    lastNames: string[];
    phoneAreaCodes: string[];
    institutions: string[];
    accountTemplates: AccountTemplate[];
    creditCardProducts: CreditCardProduct[];
    categories: CategoryTemplate[];
};

/**
 * Seed configuration and data templates used for development data generation.
 *
 * @summary Defines seed defaults, templates, and distributions for dev seeding.
 */
export const seedConfig: SeedConfig = {
    language: 'en-US',
    defaultPassword: 'DevSeed123!',
    emailDomain: 'example.com',
    userOptions: {
        themes: [Theme.DARK, Theme.LIGHT],
        languages: [Language.EN_US, Language.PT_BR],
        currencies: [Currency.BRL, Currency.USD],
        dateFormats: [DateFormat.DD_MM_YYYY, DateFormat.MM_DD_YYYY],
        profiles: [Profile.STARTER, Profile.PRO, Profile.MASTER],
        phoneChance: 0.75,
        birthDateChance: 0.85,
        activeChance: 0.98,
    },
    accountsPerUser: { min: 1, max: 3 },
    creditCardsPerUser: { min: 0, max: 2 },
    transactionsPerUser: { min: 100, max: 1000 },
    transactionDistribution: {
        creditCardShare: { min: 0.2, max: 0.45 },
        minCreditCardTransactions: 15,
        incomeShare: { min: 0.15, max: 0.32 },
        minIncomeTransactions: 12,
        observationChance: 0.85,
        subcategoryChance: 0.7,
    },
    recurringDefaults: {
        chance: 0.2,
        minDay: 1,
        maxDay: 28,
    },
    installmentDefaults: {
        chance: 0.15,
        minMonths: 2,
        maxMonths: 12,
    },
    dateRangeYears: 3,
    firstNames: [
        'Ana', 'Bruno', 'Carla', 'Diego', 'Eduardo', 'Fernanda', 'Gabriela', 'Henrique', 'Isabela', 'Joao',
        'Larissa', 'Mateus', 'Natalia', 'Otavio', 'Paula', 'Rafael', 'Sofia', 'Tiago', 'Vanessa', 'William',
    ],
    lastNames: [
        'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Ferreira', 'Almeida', 'Gomes', 'Ribeiro',
        'Costa', 'Carvalho', 'Martins', 'Araujo', 'Barbosa', 'Rocha', 'Dias', 'Moura', 'Cardoso', 'Teixeira',
    ],
    phoneAreaCodes: ['11', '21', '31', '41', '51', '61', '71', '81'],
    institutions: [
        'Nubank', 'Itau', 'Bradesco', 'Santander', 'Banco do Brasil', 'Caixa', 'Inter', 'C6 Bank', 'Neon'
    ],
    accountTemplates: [
        { name: 'Main Account', type: AccountType.CHECKING, observation: 'Primary daily account.' },
        { name: 'Payroll Account', type: AccountType.PAYROLL, observation: 'Salary deposits.' },
        { name: 'Savings Account', type: AccountType.SAVINGS, observation: 'Reserved savings.' },
        { name: 'Investment Account', type: AccountType.INVESTMENT, observation: 'Long-term investments.' },
        { name: 'Bills Account', type: AccountType.CHECKING, observation: 'Monthly expenses.' },
    ],
    creditCardProducts: [
        { name: 'Nubank Platinum', flag: CreditCardFlag.MASTERCARD, observation: 'Primary credit card.' },
        { name: 'Itau Gold', flag: CreditCardFlag.VISA, observation: 'Secondary credit card.' },
        { name: 'Santander Free', flag: CreditCardFlag.VISA, observation: 'No annual fee card.' },
        { name: 'Bradesco Elo Mais', flag: CreditCardFlag.ELO, observation: 'Rewards card.' },
        { name: 'Inter Mastercard', flag: CreditCardFlag.MASTERCARD, observation: 'Online purchases.' },
        { name: 'C6 Carbon', flag: CreditCardFlag.MASTERCARD, observation: 'Travel perks.' },
        { name: 'Ourocard Internacional', flag: CreditCardFlag.VISA, observation: 'Everyday use.' },
        { name: 'Amex Green', flag: CreditCardFlag.AMEX, observation: 'Premium benefits.' },
    ],
    categories: [
        {
            name: 'Salary',
            type: CategoryType.INCOME,
            color: CategoryColor.GREEN,
            subcategories: ['Monthly Salary', 'Bonus', 'Overtime', 'Commission', 'Allowance'],
            amountRange: { min: 2500, max: 18000 },
            merchants: ['Payroll', 'Employer', 'HR Department', 'Finance Team'],
            observationTemplates: [
                'Payroll from {merchant}',
                '{merchant} salary deposit',
                'Monthly salary - {merchant}',
                'Bonus payout - {merchant}'
            ],
            recurringChance: 0.9,
        },
        {
            name: 'Freelance',
            type: CategoryType.INCOME,
            color: CategoryColor.CYAN,
            subcategories: ['Consulting', 'Design', 'Development', 'Writing', 'Support'],
            amountRange: { min: 300, max: 9000 },
            merchants: ['Client Project', 'Contract Work', 'Side Gig', 'Freelance Client'],
            observationTemplates: [
                'Freelance payment - {merchant}',
                '{merchant} invoice',
                'Project payout - {merchant}',
                'Contract income - {merchant}'
            ],
            recurringChance: 0.25,
        },
        {
            name: 'Investments',
            type: CategoryType.INCOME,
            color: CategoryColor.BLUE,
            subcategories: ['Dividends', 'Interest', 'Capital Gains', 'Savings Yield', 'Crypto'],
            amountRange: { min: 50, max: 3500 },
            merchants: ['Brokerage', 'Savings', 'Investment Platform', 'Dividend'],
            observationTemplates: [
                'Investment income - {merchant}',
                '{merchant} yield',
                'Dividend credit - {merchant}',
                'Capital gains - {merchant}'
            ],
            recurringChance: 0.4,
        },
        {
            name: 'Housing',
            type: CategoryType.EXPENSE,
            color: CategoryColor.RED,
            subcategories: ['Rent', 'Mortgage', 'Condo Fees', 'Maintenance', 'Insurance'],
            amountRange: { min: 400, max: 5500 },
            merchants: ['Property Manager', 'Condo Office', 'Housing Services'],
            observationTemplates: [
                '{merchant} - housing payment',
                'Monthly housing - {merchant}',
                'Property expense - {merchant}'
            ],
            recurringChance: 0.85,
        },
        {
            name: 'Utilities',
            type: CategoryType.EXPENSE,
            color: CategoryColor.YELLOW,
            subcategories: ['Electricity', 'Water', 'Internet', 'Mobile', 'Gas'],
            amountRange: { min: 40, max: 450 },
            merchants: ['Utility Provider', 'Telecom', 'Internet Service'],
            observationTemplates: [
                'Utility bill - {merchant}',
                '{merchant} invoice',
                'Monthly utilities - {merchant}'
            ],
            recurringChance: 0.8,
        },
        {
            name: 'Groceries',
            type: CategoryType.EXPENSE,
            color: CategoryColor.ORANGE,
            subcategories: ['Supermarket', 'Bakery', 'Butcher', 'Convenience', 'Farmers Market'],
            amountRange: { min: 20, max: 650 },
            merchants: ['Carrefour', 'Pao de Acucar', 'Assai', 'Local Market', 'Extra'],
            observationTemplates: [
                'Groceries - {merchant}',
                '{merchant} purchase',
                'Food supplies - {merchant}'
            ],
            recurringChance: 0.1,
        },
        {
            name: 'Transport',
            type: CategoryType.EXPENSE,
            color: CategoryColor.GRAY,
            subcategories: ['Fuel', 'Ride Share', 'Public Transit', 'Parking', 'Toll'],
            amountRange: { min: 8, max: 380 },
            merchants: ['Uber', '99', 'Shell', 'Petrobras', 'Metro'],
            observationTemplates: [
                'Transport - {merchant}',
                '{merchant} ride',
                'Commute expense - {merchant}'
            ],
            recurringChance: 0.05,
        },
        {
            name: 'Dining',
            type: CategoryType.EXPENSE,
            color: CategoryColor.PINK,
            subcategories: ['Restaurant', 'Fast Food', 'Coffee', 'Delivery', 'Bar'],
            amountRange: { min: 12, max: 420 },
            merchants: ['iFood', 'Burger King', 'Starbucks', 'Local Cafe', 'Outback'],
            observationTemplates: [
                'Dining - {merchant}',
                '{merchant} meal',
                'Food and drinks - {merchant}'
            ],
            recurringChance: 0.1,
        },
        {
            name: 'Shopping',
            type: CategoryType.EXPENSE,
            color: CategoryColor.PURPLE,
            subcategories: ['Clothing', 'Electronics', 'Home Goods', 'Pharmacy', 'Gifts'],
            amountRange: { min: 25, max: 2200 },
            merchants: ['Amazon', 'Mercado Livre', 'Renner', 'Magazine Luiza', 'Farmacia'],
            observationTemplates: [
                'Shopping - {merchant}',
                '{merchant} purchase',
                'Retail expense - {merchant}'
            ],
            recurringChance: 0.08,
            installmentChance: 0.35,
        },
        {
            name: 'Entertainment',
            type: CategoryType.EXPENSE,
            color: CategoryColor.INDIGO,
            subcategories: ['Streaming', 'Movies', 'Games', 'Books', 'Events'],
            amountRange: { min: 10, max: 320 },
            merchants: ['Netflix', 'Spotify', 'Steam', 'Cinemark', 'Ticketmaster'],
            observationTemplates: [
                'Entertainment - {merchant}',
                '{merchant} subscription',
                'Leisure expense - {merchant}'
            ],
            recurringChance: 0.55,
        },
    ],
};

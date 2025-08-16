import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { format, subMonths, set } from 'date-fns';
import { AccountService } from '../service/accountService';
import { CategoryService } from '../service/categoryService';
import { SubcategoryService } from '../service/subcategoryService';
import { TransactionService } from '../service/transactionService';
import { UserService } from '../service/userService';
import {
    AccountType,
    CategoryColor,
    CategoryType,
    Currency,
    DateFormat,
    Language,
    Operator,
    Theme,
    TransactionSource,
    TransactionType,
} from '../utils/enum';

dotenv.config();

interface SeedOptions {
    seed?: number;
}

// simple pseudo random generator for deterministic sequences
function createPrng(seed: number) {
    let value = seed;
    return () => {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
    };
}

function pick<T>(arr: T[], rnd: () => number): T {
    return arr[Math.floor(rnd() * arr.length)];
}

function randInt(min: number, max: number, rnd: () => number): number {
    return Math.floor(rnd() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, rnd: () => number): number {
    return parseFloat((rnd() * (max - min) + min).toFixed(2));
}

async function seedDevDatabase({ seed }: SeedOptions = {}): Promise<void> {
    console.log('🔄 Iniciando população de dados de desenvolvimento...');

    const rng = createPrng(seed ?? Date.now());

    const userService = new UserService();
    const accountService = new AccountService();
    const categoryService = new CategoryService();
    const subcategoryService = new SubcategoryService();
    const transactionService = new TransactionService();

    const USERS = parseInt(process.env.USERS || '100', 10);
    const MONTHS = parseInt(process.env.MONTHS || '36', 10);
    const TX_MIN = parseInt(process.env.TX_PER_USER_MIN || '200', 10);
    const TX_MAX = parseInt(process.env.TX_PER_USER_MAX || '600', 10);

    const firstNames = ['Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia', 'Karina', 'Luis', 'Marina', 'Nelson', 'Olivia', 'Paulo', 'Rita', 'Sergio', 'Talita', 'Ulisses', 'Valeria', 'Willian', 'Ximena', 'Yasmin', 'Zeca'];
    const lastNames = ['Silva', 'Souza', 'Costa', 'Oliveira', 'Pereira', 'Santos', 'Ferreira', 'Lima', 'Gomes', 'Alves', 'Barbosa', 'Cardoso', 'Rodrigues', 'Almeida', 'Moraes', 'Nascimento', 'Vieira', 'Moreira', 'Ramos', 'Monteiro', 'Carvalho', 'Azevedo', 'Teixeira', 'Dias', 'Mendes'];

    const languages = [Language.PT_BR, Language.EN_US, Language.ES_ES];
    const themes = [Theme.DARK, Theme.LIGHT];
    const dateFormats = [DateFormat.DD_MM_YYYY, DateFormat.MM_DD_YYYY];
    const currencies = [Currency.BRL, Currency.USD, Currency.EUR, Currency.ARS, Currency.COP];
    const timezones = ['America/Sao_Paulo', 'America/New_York', 'Europe/Madrid', 'Europe/Berlin', 'America/Bogota'];

    const banks = ['Banco Aurora', 'Banco Horizonte', 'Banco Sol', 'Banco Vanguarda', 'Banco Atlântico'];
    const wallets = ['Vagalume Pay', 'LuzPay', 'Pulsar Wallet'];
    const cards = ['Cartão Vagalume Platinum', 'Cartão Sol Gold', 'Cartão Aurora Infinite'];

    const categoryTemplates = [
        { name: 'Alimentação', type: CategoryType.EXPENSE, color: CategoryColor.RED, subs: ['Restaurante', 'Lanches'] },
        { name: 'Transporte', type: CategoryType.EXPENSE, color: CategoryColor.BLUE, subs: ['Combustível', 'Ônibus', 'Táxi'] },
        { name: 'Moradia', type: CategoryType.EXPENSE, color: CategoryColor.GREEN, subs: ['Aluguel', 'Condomínio'] },
        { name: 'Mercado', type: CategoryType.EXPENSE, color: CategoryColor.ORANGE, subs: ['Supermercado'] },
        { name: 'Serviços', type: CategoryType.EXPENSE, color: CategoryColor.PURPLE, subs: ['Internet', 'Streaming', 'Academia', 'Assinaturas'] },
        { name: 'Saúde', type: CategoryType.EXPENSE, color: CategoryColor.CYAN, subs: ['Consulta', 'Medicamentos'] },
        { name: 'Lazer', type: CategoryType.EXPENSE, color: CategoryColor.PINK, subs: ['Cinema', 'Viagem'] },
        { name: 'Receitas', type: CategoryType.INCOME, color: CategoryColor.YELLOW, subs: ['Salário', 'Freelas', 'Bônus'] },
    ];

    const valueRanges: Record<string, [number, number]> = {
        'Alimentação:Restaurante': [20, 120],
        'Alimentação:Lanches': [15, 80],
        'Transporte:Combustível': [30, 300],
        'Transporte:Ônibus': [10, 50],
        'Transporte:Táxi': [25, 120],
        'Moradia:Aluguel': [500, 2500],
        'Moradia:Condomínio': [200, 800],
        'Mercado:Supermercado': [80, 800],
        'Serviços:Internet': [80, 150],
        'Serviços:Streaming': [20, 60],
        'Serviços:Academia': [70, 150],
        'Serviços:Assinaturas': [15, 80],
        'Saúde:Consulta': [100, 300],
        'Saúde:Medicamentos': [30, 200],
        'Lazer:Cinema': [30, 100],
        'Lazer:Viagem': [100, 400],
        'Receitas:Salário': [1000, 12000],
        'Receitas:Freelas': [200, 3000],
        'Receitas:Bônus': [200, 5000],
    };

    const accessCsv: string[] = ['nome,email,senha,idioma,tema,timezone'];

    for (let i = 0; i < USERS; i++) {
        const firstName = pick(firstNames, rng);
        const lastName = pick(lastNames, rng);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(1, 999, rng)}@dev.local`;
        const password = `Pass!${randInt(100000, 999999, rng)}`;
        const language = pick(languages, rng);
        const theme = pick(themes, rng);
        const dateFormat = pick(dateFormats, rng);
        const currency = pick(currencies, rng);
        const timezone = pick(timezones, rng);

        let userId: number | undefined;
        const existing = await userService.findWithFilters<{ id: number, email: string }>({
            email: { operator: Operator.EQUAL, value: email }
        });
        if (existing.success && existing.data && existing.data[0]) {
            userId = (existing.data[0] as any).id;
            console.log(`👤 Usuário existente encontrado: ${email}`);
        } else {
            const created = await userService.createUser({ firstName, lastName, email, password });
            if (created.success && created.data) {
                userId = created.data.id;
                await userService.updateUser(userId, { language, theme, dateFormat, currency });
                console.log(`✅ Usuário criado: ${email}`);
            }
        }
        if (!userId) continue;

        accessCsv.push(`${firstName} ${lastName},${email},${password},${language},${theme},${timezone}`);

        // Accounts
        const accounts = await accountService.getAccountsByUser(userId);
        const existingAccounts = accounts.success && accounts.data ? accounts.data : [];
        const userAccounts: { id: number; isCard: boolean }[] = [];
        const accountTemplates = [
            { name: 'Conta Corrente', institution: pick(banks, rng), type: AccountType.CHECKING, isCard: false },
            { name: 'Conta Poupança', institution: pick(banks, rng), type: AccountType.SAVINGS, isCard: false },
            { name: 'Carteira Digital', institution: pick(wallets, rng), type: AccountType.OTHER, isCard: false },
            { name: pick(cards, rng), institution: 'Cartões', type: AccountType.OTHER, isCard: true },
        ];
        for (const acc of accountTemplates) {
            const found = existingAccounts.find(a => a.name === acc.name);
            if (found) {
                userAccounts.push({ id: found.id, isCard: acc.isCard });
            } else {
                const created = await accountService.createAccount({
                    name: acc.name,
                    institution: acc.institution,
                    type: acc.type,
                    user_id: userId,
                });
                if (created.success && created.data) {
                    userAccounts.push({ id: created.data.id, isCard: acc.isCard });
                }
            }
        }

        // Categories and subcategories
        const categoriesMap: Record<string, { id: number; subs: Record<string, number> }> = {};
        const existingCats = await categoryService.getCategoriesByUser(userId);
        const currentCats = existingCats.success && existingCats.data ? existingCats.data : [];

        for (const ct of categoryTemplates) {
            let catId: number | undefined;
            const found = currentCats.find(c => c.name === ct.name);
            if (found) {
                catId = found.id;
            } else {
                const created = await categoryService.createCategory({
                    name: ct.name,
                    type: ct.type,
                    color: ct.color,
                    user_id: userId,
                });
                if (created.success && created.data) {
                    catId = created.data.id;
                }
            }
            if (!catId) continue;

            categoriesMap[ct.name] = { id: catId, subs: {} };
            const subsExisting = await subcategoryService.getSubcategoriesByCategory(catId);
            const subsList = subsExisting.success && subsExisting.data ? subsExisting.data : [];
            for (const sub of ct.subs) {
                let subId: number | undefined;
                const foundSub = subsList.find(s => s.name === sub);
                if (foundSub) {
                    subId = foundSub.id;
                } else {
                    const createdSub = await subcategoryService.createSubcategory({ name: sub, category_id: catId });
                    if (createdSub.success && createdSub.data) {
                        subId = createdSub.data.id;
                    }
                }
                if (subId) {
                    categoriesMap[ct.name].subs[sub] = subId;
                }
            }
        }

        // Transactions
        const existingTxCountRes = await transactionService.countTransactionsByUser(userId);
        const existingTxCount = existingTxCountRes.success && existingTxCountRes.data ? existingTxCountRes.data : 0;
        const targetTotal = randInt(TX_MIN, TX_MAX, rng);
        let toCreate = targetTotal - existingTxCount;
        if (toCreate <= 0) {
            console.log(`Usuário ${email} já possui ${existingTxCount} transações. Pulando criação.`);
            continue;
        }
        const transactions: any[] = [];

        // recurring monthly transactions
        for (let m = 0; m < MONTHS; m++) {
            const baseDate = subMonths(new Date(), m);
            const month = baseDate.getMonth();
            const year = baseDate.getFullYear();
            const rentDate = set(baseDate, { date: 5 });
            const internetDate = set(baseDate, { date: 10 });
            const streamDate = set(baseDate, { date: 15 });
            const salaryDate = set(baseDate, { date: 1 });
            const accountId = userAccounts[0].id;
            const rentVal = randFloat(...valueRanges['Moradia:Aluguel'], rng);
            const internetVal = randFloat(...valueRanges['Serviços:Internet'], rng);
            const streamVal = randFloat(...valueRanges['Serviços:Streaming'], rng);
            const salaryVal = randFloat(...valueRanges['Receitas:Salário'], rng);

            transactions.push({
                value: rentVal,
                date: rentDate,
                category_id: categoriesMap['Moradia'].id,
                subcategory_id: categoriesMap['Moradia'].subs['Aluguel'],
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.ACCOUNT,
                isInstallment: false,
                isRecurring: true,
                paymentDay: 5,
                account_id: accountId,
            });
            transactions.push({
                value: internetVal,
                date: internetDate,
                category_id: categoriesMap['Serviços'].id,
                subcategory_id: categoriesMap['Serviços'].subs['Internet'],
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.ACCOUNT,
                isInstallment: false,
                isRecurring: true,
                paymentDay: 10,
                account_id: accountId,
            });
            transactions.push({
                value: streamVal,
                date: streamDate,
                category_id: categoriesMap['Serviços'].id,
                subcategory_id: categoriesMap['Serviços'].subs['Streaming'],
                transactionType: TransactionType.EXPENSE,
                transactionSource: TransactionSource.ACCOUNT,
                isInstallment: false,
                isRecurring: true,
                paymentDay: 15,
                account_id: accountId,
            });
            transactions.push({
                value: salaryVal,
                date: salaryDate,
                category_id: categoriesMap['Receitas'].id,
                subcategory_id: categoriesMap['Receitas'].subs['Salário'],
                transactionType: TransactionType.INCOME,
                transactionSource: TransactionSource.ACCOUNT,
                isInstallment: false,
                isRecurring: true,
                paymentDay: 1,
                account_id: accountId,
            });
            if (month === 11) {
                transactions.push({
                    value: randFloat(600, 800, rng),
                    date: set(baseDate, { date: 20 }),
                    category_id: categoriesMap['Mercado'].id,
                    subcategory_id: categoriesMap['Mercado'].subs['Supermercado'],
                    transactionType: TransactionType.EXPENSE,
                    transactionSource: TransactionSource.ACCOUNT,
                    isInstallment: false,
                    isRecurring: false,
                    account_id: accountId,
                    observation: 'compras de fim de ano'
                });
            }
            if (month === 1) {
                transactions.push({
                    value: randFloat(200, 400, rng),
                    date: set(baseDate, { date: 7 }),
                    category_id: categoriesMap['Serviços'].id,
                    subcategory_id: categoriesMap['Serviços'].subs['Assinaturas'],
                    transactionType: TransactionType.EXPENSE,
                    transactionSource: TransactionSource.ACCOUNT,
                    isInstallment: false,
                    isRecurring: false,
                    account_id: accountId,
                    observation: 'material escolar'
                });
            }
        }

        // additional random transactions
        const notes = ['compra recorrente', 'promoção', 'cashback', 'suspeita'];
        const allCatNames = Object.keys(categoriesMap);
        while (transactions.length < toCreate) {
            const catName = pick(allCatNames, rng);
            const cat = categoriesMap[catName];
            const subNames = Object.keys(cat.subs);
            const subName = pick(subNames, rng);
            const [min, max] = valueRanges[`${catName}:${subName}`];
            const value = randFloat(min, max, rng);
            const date = (() => {
                const r = rng();
                let monthsAgo: number;
                if (r < 0.6) monthsAgo = randInt(0, Math.min(11, MONTHS - 1), rng);
                else if (r < 0.9) monthsAgo = randInt(12, Math.min(23, MONTHS - 1), rng);
                else monthsAgo = randInt(24, MONTHS - 1, rng);
                const d = subMonths(new Date(), monthsAgo);
                return set(d, { date: randInt(1, 28, rng) });
            })();
            const acc = pick(userAccounts, rng);
            transactions.push({
                value,
                date,
                category_id: cat.id,
                subcategory_id: cat.subs[subName],
                transactionType: catName === 'Receitas' ? TransactionType.INCOME : TransactionType.EXPENSE,
                transactionSource: acc.isCard ? TransactionSource.CREDIT_CARD : TransactionSource.ACCOUNT,
                isInstallment: false,
                isRecurring: false,
                account_id: acc.id,
                observation: rng() < 0.08 ? pick(notes, rng) : undefined,
            });
        }

        // insert transactions in batches
        const batchSize = 50;
        for (let b = 0; b < transactions.length; b += batchSize) {
            const slice = transactions.slice(b, b + batchSize);
            await Promise.all(slice.map(t => transactionService.createTransaction(t)));
        }
        console.log(`💰 ${transactions.length} transações adicionadas para ${email}`);
    }

    // outputs
    const outputDir = path.resolve('output');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'dev-access.csv'), accessCsv.join('\n'));

    const statsUsers = await userService.countUsers();
    const statsAccounts = await accountService.countAccounts();
    const statsCategories = await categoryService.countCategories();
    const statsSubcategories = await subcategoryService.countSubcategories();
    const statsTransactions = await transactionService.countTransactions();
    const earliest = await transactionService.getTransactions({ sort: 'date' as any, order: Operator.ASC, limit: 1 });
    const latest = await transactionService.getTransactions({ sort: 'date' as any, order: Operator.DESC, limit: 1 });

    const stats = {
        totalUsuarios: statsUsers.data || 0,
        totalContas: statsAccounts.data || 0,
        totalCategorias: statsCategories.data || 0,
        totalSubcategorias: statsSubcategories.data || 0,
        totalTransacoes: statsTransactions.data || 0,
        mediaTransacoesPorUsuario: statsTransactions.data && statsUsers.data ? Number((statsTransactions.data / statsUsers.data).toFixed(2)) : 0,
        periodo: {
            primeira: earliest.data && earliest.data[0] ? format(new Date(earliest.data[0].date), 'yyyy-MM-dd') : null,
            ultima: latest.data && latest.data[0] ? format(new Date(latest.data[0].date), 'yyyy-MM-dd') : null,
        }
    };

    fs.writeFileSync(path.join(outputDir, 'dev-stats.json'), JSON.stringify(stats, null, 2));
    console.log('📦 Arquivos de saída gerados em output/.');
    console.log('✅ Seed de desenvolvimento concluído.');
}

if (require.main === module) {
    const seedEnv = process.env.SEED_DEV ? Number(process.env.SEED_DEV) : undefined;
    seedDevDatabase({ seed: seedEnv }).catch(err => {
        console.error('Erro ao executar seed:', err);
        process.exit(1);
    });
}

export { seedDevDatabase };


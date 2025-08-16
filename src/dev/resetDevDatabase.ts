import dotenv from 'dotenv';
import { AccountService } from '../service/accountService';
import { CategoryService } from '../service/categoryService';
import { SubcategoryService } from '../service/subcategoryService';
import { TransactionService } from '../service/transactionService';
import { UserService } from '../service/userService';

dotenv.config();

async function resetDevDatabase(): Promise<void> {
    console.log('🧹 Limpando base de dados de desenvolvimento...');
    const transactionService = new TransactionService();
    const subcategoryService = new SubcategoryService();
    const categoryService = new CategoryService();
    const accountService = new AccountService();
    const userService = new UserService();

    const txs = await transactionService.getTransactions();
    if (txs.success && txs.data) {
        for (const t of txs.data) {
            await transactionService.deleteTransaction(t.id);
        }
    }

    const subs = await subcategoryService.getSubcategories();
    if (subs.success && subs.data) {
        for (const s of subs.data) {
            await subcategoryService.deleteSubcategory(s.id);
        }
    }

    const cats = await categoryService.getCategories();
    if (cats.success && cats.data) {
        for (const c of cats.data) {
            await categoryService.deleteCategory(c.id);
        }
    }

    const accounts = await accountService.getAccounts();
    if (accounts.success && accounts.data) {
        for (const a of accounts.data) {
            await accountService.deleteAccount(a.id);
        }
    }

    const users = await userService.getUsers();
    if (users.success && users.data) {
        for (const u of users.data) {
            await userService.deleteUser(u.id);
        }
    }
    console.log('✅ Base limpa.');
}

if (require.main === module) {
    resetDevDatabase().catch(err => {
        console.error('Erro ao limpar base:', err);
        process.exit(1);
    });
}

export { resetDevDatabase };


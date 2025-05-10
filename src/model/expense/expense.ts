import "reflect-metadata";
import { Table, Column, ManyToOne } from "../../utils/database/schemas/dbDecorators";
import { ColumnType, TableName, ExpenseType } from "../../utils/enum";
import Account from "../account/account";

@Table(TableName.EXPENSE)
class Expense {
    // id
    @Column({
        type: ColumnType.INTEGER
    }) id!: number;

    // value
    @Column({
        type: ColumnType.DECIMAL
    }) value!: number;

    // date
    @Column({
        type: ColumnType.DATE
    }) date!: Date;

    // category
    @Column({
        type: ColumnType.VARCHAR,
        defaultValue: null
    }) category!: string;

    // subcategory
    @Column({
        type: ColumnType.VARCHAR,
        defaultValue: null
    }) subcategory!: string;

    // observation
    @Column({
        type: ColumnType.TEXT,
        defaultValue: null
    }) observation?: string;

    // expenseType
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(ExpenseType),
    }) expenseType!: ExpenseType;

    // isInstallment
    @Column({
        type: ColumnType.BOOLEAN,
        defaultValue: false
    }) isInstallment!: boolean;

    // totalMonths
    @Column({
        type: ColumnType.INTEGER,
        defaultValue: null
    }) totalMonths?: number;

    // isRecurring
    @Column({
        type: ColumnType.BOOLEAN,
        defaultValue: false
    }) isRecurring!: boolean;

    // paymentDay
    @Column({
        type: ColumnType.INTEGER,
        defaultValue: null
    }) paymentDay?: number;

    // active
    @Column({
        type: ColumnType.BOOLEAN,
        defaultValue: true
    }) active!: boolean;

    // createdAt
    @Column({
        type: ColumnType.TIMESTAMP,
        defaultValue: ColumnType.CURRENT_TIMESTAMP
    }) createdAt!: Date;

    // updatedAt
    @Column({
        type: ColumnType.TIMESTAMP,
        defaultValue: ColumnType.CURRENT_TIMESTAMP,
        onUpdate: true
    }) updatedAt!: Date;

    // expense -> account | manyToOne
    @ManyToOne(() => Account, 'expenses')
    account!: Account;
}

export default Expense;

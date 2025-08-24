import "reflect-metadata";
import { Table, Column, ManyToOne } from "../../utils/database/schemas/dbDecorators";
import { ColumnType, TableName, TransactionSource, TransactionType } from "../../utils/enum";
import Account from "../account/account";
import CreditCard from "../creditCard/creditCard";
import Category from "../category/category";
import Subcategory from "../subcategory/subcategory";

@Table(TableName.TRANSACTION)
class Transaction {
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

    // transactionType
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(TransactionType),
    })
    transactionType!: TransactionType;

    // observation
    @Column({
        type: ColumnType.TEXT,
        defaultValue: null
    }) observation?: string;

    // transactionSource
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(TransactionSource),
    }) transactionSource!: TransactionSource;

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

    // transaction -> account | manyToOne
    @ManyToOne(() => Account, 'transactions')
    account?: Account;

    // transaction -> creditCard | manyToOne
    @ManyToOne(() => CreditCard, 'transactions')
    creditCard?: CreditCard;

    // transaction -> category | manyToOne
    @ManyToOne(() => Category, 'transactions')
    category?: Category;

    // transaction -> subcategory | manyToOne
    @ManyToOne(() => Subcategory, 'transactions')
    subcategory?: Subcategory;

}

export default Transaction;

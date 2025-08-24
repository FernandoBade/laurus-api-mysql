import "reflect-metadata";
import { Table, Column, ManyToOne, OneToOne, OneToMany } from "../../utils/database/schemas/dbDecorators";
import { ColumnType, TableName, CreditCardFlag } from "../../utils/enum";
import User from "../user/user";
import Account from "../account/account";
import Transaction from "../transaction/transaction";

@Table(TableName.CREDIT_CARD)
class CreditCard {
    // id
    @Column({
        type: ColumnType.INTEGER
    }) id!: number;

    // name
    @Column({
        type: ColumnType.VARCHAR,
        defaultValue: null
    }) name!: string;

    // flag
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(CreditCardFlag),
    }) flag!: CreditCardFlag;

    // observation
    @Column({
        type: ColumnType.TEXT,
        defaultValue: null
    }) observation?: string;

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

    // creditCard -> account | oneToOne
    @OneToOne(() => Account, 'creditCard')
    account?: Account;

    // creditCard -> user | manyToOne
    @ManyToOne(() => User, 'creditCards')
    user!: User;

    // creditCard -> transactions | oneToMany
    @OneToMany(() => Transaction, 'creditCard')
    transactions?: Transaction[];
}

export default CreditCard;

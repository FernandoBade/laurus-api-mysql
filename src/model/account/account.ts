import "reflect-metadata";
import { Table, Column, ManyToOne } from "../../utils/database/schemas/dbDecorators";
import { ColumnType, TableName, AccountType } from "../../utils/enum";
import User from "../user/user";

@Table(TableName.ACCOUNT)
class Account {
    // id
    @Column({
        type: ColumnType.INTEGER
    }) id!: number;

    // name
    @Column({
        type: ColumnType.VARCHAR,
        defaultValue: null
    }) name!: string;

    // institution
    @Column({
        type: ColumnType.VARCHAR,
        defaultValue: null
    }) institution!: string;

    // type
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(AccountType),
        defaultValue: AccountType.OTHER
    }) type!: AccountType;

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

    // account -> user | manyToOne
    @ManyToOne(() => User, 'accounts')
    user!: User;
}

export default Account;

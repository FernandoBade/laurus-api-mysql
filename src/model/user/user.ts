import "reflect-metadata";
import { Table, Column } from "../../utils/database/schemas/dbDecorators";
import { ColumnType, Currency, DateFormat, Language, TableName, Theme } from "../../utils/enum";
import Log from '../log/log';
import { OneToMany } from "../../utils/database/schemas/dbDecorators";

@Table(TableName.USER)
class User {
    // id
    @Column({
        type: ColumnType.INTEGER
    }) id!: number;

    // firstName
    @Column({
        type: ColumnType.VARCHAR,
        defaultValue: null
    }) firstName!: string;

    // lastName
    @Column({
        type: ColumnType.VARCHAR,
        defaultValue: null
    }) lastName!: string;

    // email
    @Column({
        type: ColumnType.VARCHAR,
        unique: true,
        defaultValue: null
    }) email!: string;

    // password
    @Column({
        type: ColumnType.VARCHAR,
        defaultValue: null
    }) password!: string;

    // birthDate
    @Column({
        type: ColumnType.DATE,
        defaultValue: null
    }) birthDate?: Date;

    // // phone
    // @Column({
    //     type: ColumnType.VARCHAR,
    //     defaultValue: null
    // }) phone?: string;

    // theme
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(Theme),
        defaultValue: Theme.DARK
    }) theme?: Theme;

    // language
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(Language),
        defaultValue: Language.EN_US
    }) language?: Language;

    // dateFormat
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(DateFormat),
        defaultValue: DateFormat.DD_MM_YYYY
    }) dateFormat?: DateFormat;

    // currency
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(Currency),
        defaultValue: Currency.BRL
    }) currency!: Currency;

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

    @Column({
        type: ColumnType.BOOLEAN,
        defaultValue: false,
        onUpdate: true
    }) TESTEMIGRATION!: boolean;

    // user -> log | oneToMany
    @OneToMany(() => Log, 'user') logs?: Log[];
}

export default User;

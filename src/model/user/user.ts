import "reflect-metadata";
import BaseModel from "../baseModel";
import { Table, Column, OneToMany } from "../../utils/database/dbDecorators";
import { ColumnType, Currency, DateFormat, Language, Theme } from "../../utils/enum";

@Table("user")
class User extends BaseModel {
    @Column() id!: number;

    @Column() firstName!: string;

    @Column() lastName!: string;

    @Column() email!: string;

    @Column() password!: string;

    @Column() birthDate?: Date;

    @Column() createdAt!: Date;

    @Column() phone?: string;

    @Column(
        {
            type: ColumnType.ENUM,
            enumValues: Object.values(Theme),
            defaultValue: Theme.DARK
        }
    ) theme?: Theme;

    @Column(
        {
            type: ColumnType.ENUM,
            enumValues: Object.values(Language),
            defaultValue: Language.EN_US
        }
    ) language?: Language;

    @Column(
        {
            type: ColumnType.ENUM,
            enumValues: Object.values(DateFormat),
            defaultValue: DateFormat.DD_MM_YYYY
        }
    ) dateFormat?: DateFormat;

    @Column(
        {
            type: ColumnType.ENUM,
            enumValues: Object.values(Currency),
            defaultValue: Currency.BRL
        }
    ) currency!: Currency;

    @Column(
        {
            type: ColumnType.BOOLEAN, defaultValue: true

        }
    ) active!: boolean;
}

export default User;

import "reflect-metadata";
import { Table, Column, OneToMany, ManyToOne } from "../../utils/database/schemas/dbDecorators";
import { ColumnType, TableName, CategoryColor, CategoryType } from "../../utils/enum";
import Subcategory from "../subcategory/subcategory";
import User from "../user/user";
import Transaction from "../transaction/transaction";

@Table(TableName.CATEGORY)
class Category {
    // id
    @Column({
        type: ColumnType.INTEGER
    }) id!: number;

    // name
    @Column({
        type: ColumnType.VARCHAR,
        defaultValue: null
    }) name!: string;

    // type
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(CategoryType)
    }) type!: CategoryType;

    // color
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(CategoryColor),
        defaultValue: CategoryColor.PURPLE
    }) color!: CategoryColor;

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

    // category -> user | manyToOne
    @ManyToOne(() => User, 'categories')
    user!: User;

    // category -> subcategories | oneToMany
    @OneToMany(() => Subcategory, 'category')
    subcategories?: Subcategory[];

    // category -> transactions | oneToMany
    @OneToMany(() => Transaction, 'category')
    transactions?: Transaction[];
}

export default Category;

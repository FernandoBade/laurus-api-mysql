import "reflect-metadata";
import { Table, Column, ManyToOne, OneToMany } from "../../utils/database/schemas/dbDecorators";
import { ColumnType, TableName } from "../../utils/enum";
import Category from "../category/category";
import Transaction from "../transaction/transaction";

@Table(TableName.SUBCATEGORY)
class Subcategory {
    // id
    @Column({
        type: ColumnType.INTEGER
    }) id!: number;

    // name
    @Column({
        type: ColumnType.VARCHAR,
        defaultValue: null
    }) name!: string;

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

    // subcategory -> category | manyToOne
    @ManyToOne(() => Category, 'subcategories')
    category!: Category;

    // subcategory -> transactions | oneToMany
    @OneToMany(() => Transaction, 'subcategory')
    transactions?: Transaction[];
}

export default Subcategory;

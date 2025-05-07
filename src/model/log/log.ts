import { Table, Column, ManyToOne } from '../../utils/database/schemas/dbDecorators';
import User from '../user/user';
import { ColumnType, LogType, LogOperation, LogCategory, TableName } from '../../utils/enum';

@Table(TableName.LOG)
class Log {
    // id
    @Column({
        type: ColumnType.INTEGER
    }) id!: number;

    // type
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(LogType),
    }) type!: LogType;

    // operation
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(LogOperation),
        defaultValue: LogOperation.CREATE
    }) operation!: LogOperation;

    // category
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(LogCategory),
        defaultValue: LogCategory.LOG
    }) category!: LogCategory;

    // detail
    @Column({
        type: ColumnType.TEXT,
        defaultValue: null
    }) detail!: string;


    // createdAt
    @Column({
        type: ColumnType.TIMESTAMP,
        defaultValue: ColumnType.CURRENT_TIMESTAMP,
    }) createdAt!: Date;

    // updatedAt
    @Column({
        type: ColumnType.TIMESTAMP,
        defaultValue: ColumnType.CURRENT_TIMESTAMP,
        onUpdate: true
    }) updatedAt!: Date;

    // log -> user | ManyToOne
    @ManyToOne(() => User, 'logs')
    user?: User;
}

export default Log;
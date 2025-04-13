import { Table, Column, ManyToOne } from '../../utils/database/schemas/dbDecorators';
import User from '../user/user';
import { ColumnType, LogType, Operation, LogCategory, TableName } from '../../utils/enum';

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
        enumValues: Object.values(Operation),
        defaultValue: Operation.CREATE
    }) operation!: Operation;

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

    // timestamp
    @Column({
        type: ColumnType.DATE, defaultValue: null
    }) timestamp!: Date;

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
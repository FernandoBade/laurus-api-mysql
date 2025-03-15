import { Table, Column, ManyToOne } from '../../utils/database/dbDecorators';
import User from '../user/user';
import { ColumnType, LogType, LogOperation, LogCategory } from '../../utils/enum';

@Table('log')
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

    // timestamp
    @Column({
        type: ColumnType.DATE, defaultValue: null
    }) timestamp!: Date;

    // log -> user | manyToOne
    @ManyToOne(() => User, 'logs')
    user?: User;
}

export default Log;
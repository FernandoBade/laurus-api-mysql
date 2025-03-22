import { Table, Column } from '../../utils/database/dbDecorators';
import { ColumnType, Operation, TableName } from '../../utils/enum';

@Table(TableName.MIGRATION)
class Migration {
    @Column({ type: ColumnType.INTEGER }) id!: number;

    @Column({ type: ColumnType.VARCHAR, unique: true }) name!: string;

    @Column({ type: ColumnType.VARCHAR }) tableName!: string;

    @Column({ type: ColumnType.VARCHAR }) columnName!: string;

    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(Operation),
    }) operation!: Operation;

    @Column({ type: ColumnType.TEXT }) up!: string;

    @Column({ type: ColumnType.TEXT }) down!: string;

    @Column({
        type: ColumnType.TIMESTAMP,
        defaultValue: ColumnType.CURRENT_TIMESTAMP,
        onUpdate: true,
    }) updatedAt!: Date;

    @Column({
        type: ColumnType.TIMESTAMP,
        defaultValue: ColumnType.CURRENT_TIMESTAMP,
    }) createdAt!: Date;
}

export default Migration;
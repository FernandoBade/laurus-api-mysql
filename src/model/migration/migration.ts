import { Table, Column, ManyToOne } from '../../utils/database/schemas/dbDecorators';
import { ColumnType, Operation, TableName } from '../../utils/enum';
import MigrationGroup from '../migration_group/migration_group';

@Table(TableName.MIGRATION)
class Migration {
    // id
    @Column({
        type: ColumnType.INTEGER
    }) id!: number;

    // name
    @Column({
        type: ColumnType.VARCHAR,
    }) name!: string;

    // tableName
    @Column({
        type: ColumnType.VARCHAR
    }) tableName!: string;

    // columnName
    @Column({
        type: ColumnType.VARCHAR
    }) columnName!: string;

    // operation
    @Column({
        type: ColumnType.ENUM,
        enumValues: Object.values(Operation),
    }) operation!: Operation;

    // up
    @Column({
        type: ColumnType.TEXT
    }) up!: string;

    @Column({ type: ColumnType.TEXT }) down!: string;

    // createdAt
    @Column({
        type: ColumnType.TIMESTAMP,
        defaultValue: ColumnType.CURRENT_TIMESTAMP,
    }) createdAt!: Date;

    // updatedAt
    @Column({
        type: ColumnType.TIMESTAMP,
        defaultValue: ColumnType.CURRENT_TIMESTAMP,
        onUpdate: true,
    }) updatedAt!: Date;

    // migration -> migration_group
    @ManyToOne(() => MigrationGroup, 'migrations')
    migrationGroup?: MigrationGroup;
}

export default Migration;
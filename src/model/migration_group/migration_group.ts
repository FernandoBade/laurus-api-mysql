import { Table, Column, OneToMany } from '../../utils/database/schemas/dbDecorators';
import { ColumnType, LogOperation, TableName } from '../../utils/enum';
import Migration from '../migration/migration';

@Table(TableName.MIGRATION_GROUP)
class MigrationGroup {
    // id
    @Column({
        type: ColumnType.INTEGER
    }) id!: number;

    // name
    @Column({
        type: ColumnType.VARCHAR,
        unique: true,
    }) name!: string;

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

    // migration_group -> migration | OneToMany
    @OneToMany(() => Migration, 'migrationGroup')
    migrations?: Migration[];
}

export default MigrationGroup;
import { Table, Column, ManyToOne } from '../../utils/database/schemas/dbDecorators';
import { ColumnType, TableName } from '../../utils/enum';
import User from '../user/user';

@Table(TableName.REFRESH_TOKEN)
class RefreshToken {
    // id
    @Column({
        type: ColumnType.INTEGER
    }) id!: number;

    // token
    @Column({
        type: ColumnType.VARCHAR,
        unique: true
    }) token!: string;


    // expiresAt
    @Column({
        type: ColumnType.TIMESTAMP
    }) expiresAt!: Date;

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

    // refresh_token -> user | ManyToOne
    @ManyToOne(() => User, 'refreshTokens')
    user?: User;
}

export default RefreshToken;

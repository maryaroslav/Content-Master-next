import {
    Model,
    DataTypes,
    type Sequelize,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
} from 'sequelize';
import type { User } from './User';
import type { Models } from './index';

export class RefreshToken extends Model<InferAttributes<RefreshToken>, InferCreationAttributes<RefreshToken>> {
    declare id: CreationOptional<number>;
    declare user_id: ForeignKey<User['user_id']>;
    declare token_hash: string;
    declare family_id: string;
    declare expires_at: Date;
    declare revoked_at: CreationOptional<Date | null>;
    declare user_agent: CreationOptional<string | null>;
    declare created_at: CreationOptional<Date>;

    static initModel(sequelize: Sequelize) {
        RefreshToken.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                user_id: { type: DataTypes.INTEGER, allowNull: false },
                token_hash: { type: DataTypes.CHAR(64), allowNull: false, unique: true },
                family_id: { type: DataTypes.CHAR(36), allowNull: false },
                expires_at: { type: DataTypes.DATE, allowNull: false },
                revoked_at: { type: DataTypes.DATE, allowNull: true },
                user_agent: { type: DataTypes.STRING(255), allowNull: true },
                created_at: DataTypes.DATE,
            },
            {
                sequelize,
                modelName: 'RefreshToken',
                tableName: 'refresh_tokens',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: false,
            }
        );
        return RefreshToken;
    }

    static associate(models: Models) {
        RefreshToken.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    }
}

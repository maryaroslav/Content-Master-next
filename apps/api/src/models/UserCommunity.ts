import {
    Model,
    DataTypes,
    type Sequelize,
    type InferAttributes,
    type InferCreationAttributes,
    type NonAttribute,
} from 'sequelize';
import type { User } from './User';
import type { Community } from './Community';
import type { Models } from './index';

export class UserCommunity extends Model<
    InferAttributes<UserCommunity, { omit: 'User' | 'Community' }>,
    InferCreationAttributes<UserCommunity, { omit: 'User' | 'Community' }>
> {
    declare user_id: number;
    declare community_id: number;

    declare User?: NonAttribute<User>;
    declare Community?: NonAttribute<Community>;

    static initModel(sequelize: Sequelize) {
        UserCommunity.init(
            {
                user_id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    allowNull: false,
                },
                community_id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'UserCommunity',
                tableName: 'users_communities',
                timestamps: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_0900_ai_ci',
            }
        );
        return UserCommunity;
    }

    static associate(models: Models) {
        UserCommunity.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        UserCommunity.belongsTo(models.Community, {
            foreignKey: 'community_id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    }
}

import {
    Model,
    DataTypes,
    type Sequelize,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
    type NonAttribute,
} from 'sequelize';
import type { User } from './User';
import type { Models } from './index';

export class Follow extends Model<
    InferAttributes<Follow, { omit: 'Follower' | 'Following' }>,
    InferCreationAttributes<Follow, { omit: 'Follower' | 'Following' }>
> {
    declare follow_id: CreationOptional<number>;
    declare follower_id: ForeignKey<User['user_id']>;
    declare following_id: ForeignKey<User['user_id']>;
    declare created_at: CreationOptional<Date>;

    declare Follower?: NonAttribute<User>;
    declare Following?: NonAttribute<User>;

    static initModel(sequelize: Sequelize) {
        Follow.init(
            {
                follow_id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                follower_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                following_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            },
            {
                sequelize,
                modelName: 'Follow',
                tableName: 'follows',
                timestamps: false,
            }
        );
        return Follow;
    }

    static associate(models: Models) {
        Follow.belongsTo(models.User, {
            foreignKey: 'follower_id',
            as: 'Follower',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        Follow.belongsTo(models.User, {
            foreignKey: 'following_id',
            as: 'Following',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    }
}

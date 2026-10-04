import {
    Model,
    DataTypes,
    type Sequelize,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type NonAttribute,
} from 'sequelize';
import type { Community } from './Community';
import type { Message } from './Message';
import type { Models } from './index';

export class User extends Model<
    InferAttributes<User, { omit: 'ownedCommunities' | 'communities' | 'SentMessages' | 'ReceivedMessages' }>,
    InferCreationAttributes<User, { omit: 'ownedCommunities' | 'communities' | 'SentMessages' | 'ReceivedMessages' }>
> {
    declare user_id: CreationOptional<number>;
    declare username: string;
    declare email: string;
    declare password_hash: string;
    declare full_name: CreationOptional<string | null>;
    declare bio: CreationOptional<string | null>;
    declare profile_picture: CreationOptional<string | null>;
    declare is_active: CreationOptional<boolean>;
    declare role: CreationOptional<string>;
    declare twoFactorEnabled: CreationOptional<boolean | null>;
    declare twoFactorSecret: CreationOptional<string | null>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare ownedCommunities?: NonAttribute<Community[]>;
    declare communities?: NonAttribute<Community[]>;
    declare SentMessages?: NonAttribute<Message[]>;
    declare ReceivedMessages?: NonAttribute<Message[]>;

    static initModel(sequelize: Sequelize) {
        User.init(
            {
                user_id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false,
                },
                username: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    unique: true,
                },
                email: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    unique: true,
                    validate: {
                        isEmail: true,
                    },
                },
                password_hash: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                full_name: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                    defaultValue: null,
                },
                bio: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    defaultValue: null,
                },
                profile_picture: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                    defaultValue: null,
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
                role: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    defaultValue: 'user',
                },
                twoFactorEnabled: {
                    type: DataTypes.BOOLEAN,
                    allowNull: true,
                    defaultValue: false,
                },
                twoFactorSecret: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                    defaultValue: null,
                },
                created_at: DataTypes.DATE,
                updated_at: DataTypes.DATE,
            },
            {
                sequelize,
                modelName: 'User',
                tableName: 'users',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                charset: 'utf8mb4',
                collate: 'utf8mb4_0900_ai_ci',
            }
        );
        return User;
    }

    static associate(models: Models) {
        User.hasMany(models.Community, {
            foreignKey: 'owner_id',
            as: 'ownedCommunities',
        });
        User.belongsToMany(models.Community, {
            through: models.UserCommunity,
            foreignKey: 'user_id',
            otherKey: 'community_id',
            as: 'communities',
        });
        User.hasMany(models.Message, {
            foreignKey: 'from_user_id',
            as: 'SentMessages',
        });
        User.hasMany(models.Message, {
            foreignKey: 'to_user_id',
            as: 'ReceivedMessages',
        });
    }
}

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

export type MessageType = 'text' | 'image';

export class Message extends Model<
    InferAttributes<Message, { omit: 'FromUser' | 'ToUser' }>,
    InferCreationAttributes<Message, { omit: 'FromUser' | 'ToUser' }>
> {
    declare message_id: CreationOptional<number>;
    declare from_user_id: ForeignKey<User['user_id']>;
    declare to_user_id: ForeignKey<User['user_id']>;
    declare content: CreationOptional<string | null>;
    declare media_url: CreationOptional<string | null>;
    declare type: CreationOptional<MessageType>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare FromUser?: NonAttribute<User>;
    declare ToUser?: NonAttribute<User>;

    static initModel(sequelize: Sequelize) {
        Message.init(
            {
                message_id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                from_user_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                to_user_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                content: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                media_url: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                type: {
                    type: DataTypes.ENUM('text', 'image'),
                    allowNull: false,
                    defaultValue: 'text',
                },
                created_at: DataTypes.DATE,
                updated_at: DataTypes.DATE,
            },
            {
                sequelize,
                modelName: 'Message',
                tableName: 'messages',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                charset: 'utf8mb4',
                collate: 'utf8mb4_0900_ai_ci',
            }
        );
        return Message;
    }

    static associate(models: Models) {
        Message.belongsTo(models.User, {
            foreignKey: 'from_user_id',
            as: 'FromUser',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        Message.belongsTo(models.User, {
            foreignKey: 'to_user_id',
            as: 'ToUser',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    }
}

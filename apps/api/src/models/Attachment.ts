import {
    Model,
    DataTypes,
    type Sequelize,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
} from 'sequelize';
import type { Message } from './Message';
import type { User } from './User';
import type { Models } from './index';

export class Attachment extends Model<InferAttributes<Attachment>, InferCreationAttributes<Attachment>> {
    declare id: CreationOptional<number>;
    declare uploader_id: ForeignKey<User['user_id']>;
    declare message_id: CreationOptional<ForeignKey<Message['message_id']> | null>;
    declare storage_key: string;
    declare mime_type: string;
    declare size: CreationOptional<number | null>;
    declare width: CreationOptional<number | null>;
    declare height: CreationOptional<number | null>;
    declare created_at: CreationOptional<Date>;

    static initModel(sequelize: Sequelize) {
        Attachment.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                uploader_id: { type: DataTypes.INTEGER, allowNull: false },
                message_id: { type: DataTypes.INTEGER, allowNull: true },
                storage_key: { type: DataTypes.STRING(255), allowNull: false, unique: true },
                mime_type: { type: DataTypes.STRING(100), allowNull: false },
                size: { type: DataTypes.INTEGER, allowNull: true },
                width: { type: DataTypes.INTEGER, allowNull: true },
                height: { type: DataTypes.INTEGER, allowNull: true },
                created_at: DataTypes.DATE,
            },
            {
                sequelize,
                modelName: 'Attachment',
                tableName: 'attachments',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: false,
            }
        );
        return Attachment;
    }

    static associate(models: Models) {
        Attachment.belongsTo(models.User, { foreignKey: 'uploader_id', as: 'uploader', onDelete: 'CASCADE' });
        Attachment.belongsTo(models.Message, { foreignKey: 'message_id', onDelete: 'CASCADE' });
    }
}

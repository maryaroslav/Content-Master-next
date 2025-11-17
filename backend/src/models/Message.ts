import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export type MessageType = 'text' | 'image';

export interface MessageAttributes {
    message_id: number;
    from_user_id: number;
    to_user_id: number;
    content?: string | null;
    media_url?: string | null;
    type: MessageType;
    created_at?: Date;
    updated_at?: Date;
}

export type MessageCreationAttributes = Optional<
    MessageAttributes,
    'message_id' | 'content' | 'media_url' | 'created_at' | 'updated_at'
>;

export interface MessageInstance
    extends Model<MessageAttributes, MessageCreationAttributes>,
    MessageAttributes { }

export default function MessageModelFactory(sequelize: Sequelize) {
    const Message = sequelize.define<MessageInstance>(
        'Message',
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
        },
        {
            tableName: 'messages',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8mb4',
            collate: 'utf8mb4_0900_ai_ci',
        }
    );

    (Message as any).associate = (models: any) => {
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
    };

    return Message;
}
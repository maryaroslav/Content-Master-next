import { DataTypes } from 'sequelize';
import type { Migration } from '../migrator';

export const up: Migration = async ({ context: queryInterface }) => {
    await queryInterface.createTable(
        'attachments',
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            uploader_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'user_id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            message_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'messages', key: 'message_id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            storage_key: { type: DataTypes.STRING(255), allowNull: false, unique: true },
            mime_type: { type: DataTypes.STRING(100), allowNull: false },
            size: { type: DataTypes.INTEGER, allowNull: true },
            width: { type: DataTypes.INTEGER, allowNull: true },
            height: { type: DataTypes.INTEGER, allowNull: true },
            created_at: { type: DataTypes.DATE, allowNull: false },
        },
        { charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' }
    );
    await queryInterface.addIndex('attachments', ['message_id'], { name: 'attachments_message_idx' });
    await queryInterface.addIndex('attachments', ['uploader_id', 'message_id'], { name: 'attachments_uploader_message_idx' });

    // Only files we stored ourselves can become attachments; any other URL a client sent is not carried over.
    await queryInterface.sequelize.query(`
        INSERT INTO attachments (uploader_id, message_id, storage_key, mime_type, created_at)
        SELECT from_user_id, message_id, SUBSTRING(media_url, LENGTH('/uploads/') + 1), 'image/webp', created_at
        FROM messages
        WHERE media_url LIKE '/uploads/chat\\_images/%'
    `);
};

export const down: Migration = async ({ context: queryInterface }) => {
    await queryInterface.dropTable('attachments');
};

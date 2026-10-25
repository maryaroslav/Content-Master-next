import { DataTypes } from 'sequelize';
import type { Migration } from '../migrator';

export const up: Migration = async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('messages', 'media_url');
};

export const down: Migration = async ({ context: queryInterface }) => {
    await queryInterface.addColumn('messages', 'media_url', { type: DataTypes.STRING(255), allowNull: true });
    await queryInterface.sequelize.query(`
        UPDATE messages m
        JOIN (SELECT message_id, MIN(id) AS id FROM attachments WHERE message_id IS NOT NULL GROUP BY message_id) first ON first.message_id = m.message_id
        JOIN attachments a ON a.id = first.id
        SET m.media_url = CONCAT('/uploads/', a.storage_key)
    `);
};

import { DataTypes } from 'sequelize';
import type { Migration } from '../migrator';

export const up: Migration = async ({ context: queryInterface }) => {
    await queryInterface.createTable(
        'refresh_tokens',
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'user_id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            token_hash: { type: DataTypes.CHAR(64), allowNull: false, unique: true },
            family_id: { type: DataTypes.CHAR(36), allowNull: false },
            expires_at: { type: DataTypes.DATE, allowNull: false },
            revoked_at: { type: DataTypes.DATE, allowNull: true },
            user_agent: { type: DataTypes.STRING(255), allowNull: true },
            created_at: { type: DataTypes.DATE, allowNull: false },
        },
        { charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' }
    );
    await queryInterface.addIndex('refresh_tokens', ['family_id'], { name: 'refresh_tokens_family_idx' });
};

export const down: Migration = async ({ context: queryInterface }) => {
    await queryInterface.dropTable('refresh_tokens');
};

import { DataTypes, QueryTypes } from 'sequelize';
import type { Migration } from '../migrator';

const UPLOADS_PREFIX = '/uploads/';

export const up: Migration = async ({ context: queryInterface }) => {
    const { sequelize } = queryInterface;

    await queryInterface.createTable(
        'post_images',
        {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            post_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'posts', key: 'post_id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            image_key: { type: DataTypes.STRING(255), allowNull: false },
            position: { type: DataTypes.INTEGER, allowNull: false },
        },
        { charset: 'utf8mb4', collate: 'utf8mb4_0900_ai_ci' }
    );
    await queryInterface.addIndex('post_images', ['post_id', 'position'], { name: 'post_images_post_position_unique', unique: true });

    const posts = await sequelize.query<{ post_id: number; image_url: string | null }>(
        'SELECT post_id, image_url FROM posts',
        { type: QueryTypes.SELECT }
    );
    for (const post of posts) {
        let paths: unknown;
        try {
            paths = JSON.parse(post.image_url ?? '[]');
        } catch {
            paths = [];
        }
        if (!Array.isArray(paths)) continue;

        const rows = paths
            .filter((p): p is string => typeof p === 'string' && p.length > 0)
            .map((p, position) => ({ post_id: post.post_id, image_key: p.replace(UPLOADS_PREFIX, '').replace(/^\//, ''), position }));
        if (rows.length > 0) await queryInterface.bulkInsert('post_images', rows);
    }

    await queryInterface.removeColumn('posts', 'image_url');
};

export const down: Migration = async ({ context: queryInterface }) => {
    const { sequelize } = queryInterface;

    await queryInterface.addColumn('posts', 'image_url', { type: DataTypes.TEXT, allowNull: true });

    const images = await sequelize.query<{ post_id: number; image_key: string }>(
        'SELECT post_id, image_key FROM post_images ORDER BY post_id, position',
        { type: QueryTypes.SELECT }
    );
    const pathsByPost = new Map<number, string[]>();
    for (const image of images) {
        pathsByPost.set(image.post_id, [...(pathsByPost.get(image.post_id) ?? []), UPLOADS_PREFIX + image.image_key]);
    }
    await sequelize.query(`UPDATE posts SET image_url = '[]'`);
    for (const [postId, paths] of pathsByPost) {
        await sequelize.query('UPDATE posts SET image_url = :value WHERE post_id = :postId', {
            replacements: { value: JSON.stringify(paths), postId },
        });
    }
    await queryInterface.changeColumn('posts', 'image_url', { type: DataTypes.TEXT, allowNull: false });

    await queryInterface.dropTable('post_images');
};

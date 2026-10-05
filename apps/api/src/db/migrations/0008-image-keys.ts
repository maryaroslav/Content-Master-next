import type { Migration } from '../migrator';

// Images are stored as storage keys relative to the uploads root ("communities_images/x.webp").
// users.profile_picture already has that shape; messages.media_url is client-supplied and changes with the chat rework.
export const up: Migration = async ({ context: queryInterface }) => {
    const { sequelize } = queryInterface;
    await sequelize.query(`UPDATE communities SET photo = CONCAT('communities_images/', photo) WHERE photo NOT LIKE '%/%'`);
    await sequelize.query(`UPDATE events SET image = SUBSTRING(image, LENGTH('/uploads/') + 1) WHERE image LIKE '/uploads/%'`);
};

export const down: Migration = async ({ context: queryInterface }) => {
    const { sequelize } = queryInterface;
    await sequelize.query(
        `UPDATE communities SET photo = SUBSTRING(photo, LENGTH('communities_images/') + 1) WHERE photo LIKE 'communities\\_images/%'`
    );
    await sequelize.query(`UPDATE events SET image = CONCAT('/uploads/', image) WHERE image NOT LIKE '/%'`);
};

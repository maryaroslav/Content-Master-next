import type { Migration } from '../migrator';

const recountMembers = `
    UPDATE communities c
    SET members_count = (SELECT COUNT(*) FROM users_communities uc WHERE uc.community_id = c.community_id)
`;

export const up: Migration = async ({ context: queryInterface }) => {
    const { sequelize } = queryInterface;
    await sequelize.query(`
        INSERT IGNORE INTO users_communities (user_id, community_id)
        SELECT owner_id, community_id FROM communities
    `);
    await sequelize.query(recountMembers);
};

export const down: Migration = async ({ context: queryInterface }) => {
    const { sequelize } = queryInterface;
    await sequelize.query(`
        DELETE uc FROM users_communities uc
        JOIN communities c ON c.community_id = uc.community_id AND c.owner_id = uc.user_id
    `);
    await sequelize.query(recountMembers);
};

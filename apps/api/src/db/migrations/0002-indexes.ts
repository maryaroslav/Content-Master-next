import type { Migration } from '../migrator';

export const up: Migration = async ({ context: queryInterface }) => {
    const { sequelize } = queryInterface;

    // A user can follow another user only once. Remove duplicates before adding the constraint.
    // Keeps the oldest row of each pair; the derived table is required because MySQL
    // cannot select from the table it deletes from.
    await sequelize.query(`
        DELETE FROM follows
        WHERE follow_id NOT IN (
            SELECT keep_id FROM (
                SELECT MIN(follow_id) AS keep_id FROM follows GROUP BY follower_id, following_id
            ) AS kept
        )
    `);
    await queryInterface.addIndex('follows', ['follower_id', 'following_id'], {
        name: 'follows_follower_following_unique',
        unique: true,
    });

    // Conversation history: WHERE (from = ? AND to = ?) OR (from = ? AND to = ?) ORDER BY created_at.
    await queryInterface.addIndex('messages', ['from_user_id', 'to_user_id', 'created_at'], {
        name: 'messages_conversation_idx',
    });

    // Feed: ORDER BY created_at DESC.
    await queryInterface.addIndex('posts', ['created_at'], { name: 'posts_created_at_idx' });

    // These unique keys duplicate the primary keys (left over from `sequelize.sync()`).
    await queryInterface.removeIndex('users_communities', 'users_communities_community_id_user_id_unique');
    await queryInterface.removeIndex('users_events', 'users_events_event_id_user_id_unique');
};

export const down: Migration = async ({ context: queryInterface }) => {
    await queryInterface.addIndex('users_events', ['user_id', 'event_id'], {
        name: 'users_events_event_id_user_id_unique',
        unique: true,
    });
    await queryInterface.addIndex('users_communities', ['user_id', 'community_id'], {
        name: 'users_communities_community_id_user_id_unique',
        unique: true,
    });
    await queryInterface.removeIndex('posts', 'posts_created_at_idx');
    await queryInterface.removeIndex('messages', 'messages_conversation_idx');
    await queryInterface.removeIndex('follows', 'follows_follower_following_unique');
};

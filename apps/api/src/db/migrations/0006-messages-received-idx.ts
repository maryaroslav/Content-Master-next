import type { Migration } from '../migrator';

// Mirror of messages_conversation_idx for the receiving side, so "latest message per sender" is an index lookup.
export const up: Migration = async ({ context: queryInterface }) => {
    await queryInterface.addIndex('messages', ['to_user_id', 'from_user_id', 'created_at'], {
        name: 'messages_received_idx',
    });
};

export const down: Migration = async ({ context: queryInterface }) => {
    await queryInterface.removeIndex('messages', 'messages_received_idx');
};

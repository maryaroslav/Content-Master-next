import type { Migration } from '../migrator';

/**
 * Schema as it existed before migrations were introduced (previously created by `sequelize.sync()`).
 * `IF NOT EXISTS` makes it a no-op on existing databases and creates the schema on new ones.
 */
const tables = [
    `CREATE TABLE IF NOT EXISTS \`users\` (
        \`user_id\` int NOT NULL AUTO_INCREMENT,
        \`username\` varchar(50) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`full_name\` varchar(100) DEFAULT NULL,
        \`bio\` text,
        \`profile_picture\` varchar(255) DEFAULT NULL,
        \`is_active\` tinyint(1) NOT NULL DEFAULT '1',
        \`role\` varchar(50) NOT NULL DEFAULT 'user',
        \`twoFactorEnabled\` tinyint(1) DEFAULT '0',
        \`twoFactorSecret\` varchar(255) DEFAULT NULL,
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NOT NULL,
        PRIMARY KEY (\`user_id\`),
        UNIQUE KEY \`username\` (\`username\`),
        UNIQUE KEY \`email\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,

    `CREATE TABLE IF NOT EXISTS \`communities\` (
        \`community_id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`privacy\` varchar(50) NOT NULL,
        \`description\` text,
        \`photo\` varchar(255) NOT NULL,
        \`owner_id\` int NOT NULL,
        \`members_count\` int NOT NULL DEFAULT '0',
        \`theme\` varchar(255) NOT NULL,
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NOT NULL,
        PRIMARY KEY (\`community_id\`),
        KEY \`owner_id\` (\`owner_id\`),
        CONSTRAINT \`communities_ibfk_1\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,

    `CREATE TABLE IF NOT EXISTS \`events\` (
        \`event_id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(255) NOT NULL,
        \`description\` text,
        \`image\` varchar(255) NOT NULL,
        \`owner_id\` int NOT NULL,
        \`members_count\` int DEFAULT '0',
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NOT NULL,
        PRIMARY KEY (\`event_id\`),
        KEY \`owner_id\` (\`owner_id\`),
        CONSTRAINT \`events_ibfk_1\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,

    `CREATE TABLE IF NOT EXISTS \`follows\` (
        \`follow_id\` int NOT NULL AUTO_INCREMENT,
        \`follower_id\` int NOT NULL,
        \`following_id\` int NOT NULL,
        \`created_at\` datetime NOT NULL,
        PRIMARY KEY (\`follow_id\`),
        KEY \`follower_id\` (\`follower_id\`),
        KEY \`following_id\` (\`following_id\`),
        CONSTRAINT \`follows_ibfk_1\` FOREIGN KEY (\`follower_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`follows_ibfk_2\` FOREIGN KEY (\`following_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,

    `CREATE TABLE IF NOT EXISTS \`messages\` (
        \`message_id\` int NOT NULL AUTO_INCREMENT,
        \`from_user_id\` int NOT NULL,
        \`to_user_id\` int NOT NULL,
        \`content\` text,
        \`media_url\` varchar(255) DEFAULT NULL,
        \`type\` enum('text','image') NOT NULL DEFAULT 'text',
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NOT NULL,
        PRIMARY KEY (\`message_id\`),
        KEY \`from_user_id\` (\`from_user_id\`),
        KEY \`to_user_id\` (\`to_user_id\`),
        CONSTRAINT \`messages_ibfk_1\` FOREIGN KEY (\`from_user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`messages_ibfk_2\` FOREIGN KEY (\`to_user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,

    `CREATE TABLE IF NOT EXISTS \`posts\` (
        \`post_id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(100) DEFAULT NULL,
        \`content\` text,
        \`image_url\` text NOT NULL,
        \`author_id\` int NOT NULL,
        \`created_at\` datetime NOT NULL,
        \`updated_at\` datetime NOT NULL,
        PRIMARY KEY (\`post_id\`),
        KEY \`author_id\` (\`author_id\`),
        CONSTRAINT \`posts_ibfk_1\` FOREIGN KEY (\`author_id\`) REFERENCES \`users\` (\`user_id\`) ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,

    `CREATE TABLE IF NOT EXISTS \`users_communities\` (
        \`user_id\` int NOT NULL,
        \`community_id\` int NOT NULL,
        PRIMARY KEY (\`user_id\`,\`community_id\`),
        UNIQUE KEY \`users_communities_community_id_user_id_unique\` (\`user_id\`,\`community_id\`),
        KEY \`community_id\` (\`community_id\`),
        CONSTRAINT \`users_communities_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`users_communities_ibfk_2\` FOREIGN KEY (\`community_id\`) REFERENCES \`communities\` (\`community_id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,

    `CREATE TABLE IF NOT EXISTS \`users_events\` (
        \`user_id\` int NOT NULL,
        \`event_id\` int NOT NULL,
        PRIMARY KEY (\`user_id\`,\`event_id\`),
        UNIQUE KEY \`users_events_event_id_user_id_unique\` (\`user_id\`,\`event_id\`),
        KEY \`event_id\` (\`event_id\`),
        CONSTRAINT \`users_events_ibfk_1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`users_events_ibfk_2\` FOREIGN KEY (\`event_id\`) REFERENCES \`events\` (\`event_id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`,
];

export const up: Migration = async ({ context: queryInterface }) => {
    for (const sql of tables) {
        await queryInterface.sequelize.query(sql);
    }
};

export const down: Migration = async () => {
    throw new Error('The baseline migration cannot be reverted: it would drop every table.');
};

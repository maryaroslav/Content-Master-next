import { QueryTypes } from 'sequelize';
import type { Migration } from '../migrator';
import { decryptSecret, encryptSecret, isEncryptedSecret } from '../../auth/secretBox';

interface Row {
    user_id: number;
    twoFactorSecret: string;
}

const selectSecrets = `SELECT user_id, twoFactorSecret FROM users WHERE twoFactorSecret IS NOT NULL`;
const updateSecret = `UPDATE users SET twoFactorSecret = :secret WHERE user_id = :id`;

export const up: Migration = async ({ context: queryInterface }) => {
    const { sequelize } = queryInterface;
    const rows = await sequelize.query<Row>(selectSecrets, { type: QueryTypes.SELECT });
    for (const row of rows.filter((r) => !isEncryptedSecret(r.twoFactorSecret))) {
        await sequelize.query(updateSecret, { replacements: { id: row.user_id, secret: encryptSecret(row.twoFactorSecret) } });
    }
};

export const down: Migration = async ({ context: queryInterface }) => {
    const { sequelize } = queryInterface;
    const rows = await sequelize.query<Row>(selectSecrets, { type: QueryTypes.SELECT });
    for (const row of rows.filter((r) => isEncryptedSecret(r.twoFactorSecret))) {
        await sequelize.query(updateSecret, { replacements: { id: row.user_id, secret: decryptSecret(row.twoFactorSecret) } });
    }
};

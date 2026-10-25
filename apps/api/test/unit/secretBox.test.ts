import { describe, expect, it } from 'vitest';
import { decryptSecret, encryptSecret, isEncryptedSecret } from '../../src/auth/secretBox';

describe('secretBox', () => {
    it('decrypts what it encrypted', () => {
        const encrypted = encryptSecret('JBSWY3DPEHPK3PXP');
        expect(isEncryptedSecret(encrypted)).toBe(true);
        expect(decryptSecret(encrypted)).toBe('JBSWY3DPEHPK3PXP');
    });

    it('produces a different ciphertext each time', () => {
        expect(encryptSecret('same')).not.toBe(encryptSecret('same'));
    });

    it('rejects a tampered ciphertext', () => {
        const encrypted = encryptSecret('JBSWY3DPEHPK3PXP');
        const data = Buffer.from(encrypted.slice(3), 'base64');
        data[data.length - 1] ^= 1;
        expect(() => decryptSecret(`v1:${data.toString('base64')}`)).toThrow();
    });

    it('refuses a secret that was never encrypted', () => {
        expect(isEncryptedSecret('JBSWY3DPEHPK3PXP')).toBe(false);
        expect(() => decryptSecret('JBSWY3DPEHPK3PXP')).toThrow(/not encrypted/);
    });
});

import argon2 from 'argon2';

const ARGON2_OPTIONS: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 65536 KiB
    timeCost: 3,
    parallelism: 1,
};

export async function hashPassword(plainTextPassword: string): Promise<string> {
    try {
        return await argon2.hash(plainTextPassword, ARGON2_OPTIONS);
    } catch (err) {
        console.error('Error hashing password:', err);
        throw new Error('Password hashing failed.');
    }
}

export async function verifyPassword(
    hashedPassword: string,
    plainTextPassword: string
): Promise<boolean> {
    try {
        return await argon2.verify(
            hashedPassword,
            plainTextPassword,
            ARGON2_OPTIONS
        );
    } catch (err) {
        console.error('Error verifying password (or password mismatch):', err);
        return false;
    }
}

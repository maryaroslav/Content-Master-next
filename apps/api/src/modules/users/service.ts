import bcrypt from 'bcrypt';
import { UniqueConstraintError } from 'sequelize';
import type { ChangeEmailRequest, UpdateProfileRequest } from '@cm/contracts';
import { User, Follow } from '../../models';
import { AppError } from '../../lib/errors';
import { deleteFiles, saveImage } from '../../storage/images';

export async function getUser(userId: number): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    return user;
}

async function getUserByUsername(username: string): Promise<User> {
    const user = await User.findOne({ where: { username } });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    return user;
}

export async function getFollowStatus(viewerId: number, userId: number) {
    const [isFollowing, followersCount] = await Promise.all([
        Follow.count({ where: { follower_id: viewerId, following_id: userId } }).then((n) => n > 0),
        Follow.count({ where: { following_id: userId } }),
    ]);
    return { isFollowing, followersCount };
}

export async function getProfile(username: string, viewerId: number) {
    const user = await getUserByUsername(username);
    return { user, ...(await getFollowStatus(viewerId, user.user_id)) };
}

export async function follow(followerId: number, userId: number): Promise<{ created: boolean }> {
    if (followerId === userId) throw new AppError(400, 'CANNOT_FOLLOW_SELF', 'You cannot follow yourself');
    await getUser(userId);

    const [, created] = await Follow.findOrCreate({ where: { follower_id: followerId, following_id: userId } });
    return { created };
}

export async function unfollow(followerId: number, userId: number): Promise<{ removed: boolean }> {
    const removed = await Follow.destroy({ where: { follower_id: followerId, following_id: userId } });
    return { removed: removed > 0 };
}

async function saveUnique(user: User, changes: Partial<Pick<User, 'username' | 'email' | 'full_name' | 'bio'>>): Promise<User> {
    const conflict = (field: 'username' | 'email') =>
        new AppError(409, `${field.toUpperCase()}_TAKEN`, `This ${field} is already taken`);

    for (const field of ['username', 'email'] as const) {
        const value = changes[field];
        if (value !== undefined && value !== user[field] && (await User.count({ where: { [field]: value } })) > 0) {
            throw conflict(field);
        }
    }
    try {
        return await user.update(changes);
    } catch (err) {
        if (err instanceof UniqueConstraintError) throw conflict(changes.email !== undefined ? 'email' : 'username');
        throw err;
    }
}

export async function updateProfile(userId: number, { username, fullName, bio }: UpdateProfileRequest): Promise<User> {
    const user = await getUser(userId);
    return saveUnique(user, {
        ...(username !== undefined && { username }),
        ...(fullName !== undefined && { full_name: fullName || null }),
        ...(bio !== undefined && { bio: bio || null }),
    });
}

export async function changeEmail(userId: number, { email, currentPassword }: ChangeEmailRequest): Promise<User> {
    const user = await getUser(userId);
    // 403 rather than 401: the session is valid, only the confirmation failed.
    if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
        throw new AppError(403, 'INVALID_PASSWORD', 'Current password is incorrect');
    }
    return saveUnique(user, { email });
}

export async function deleteAvatar(userId: number): Promise<User> {
    const user = await getUser(userId);
    const key = user.profile_picture;
    if (!key) return user;

    await user.update({ profile_picture: null });
    await deleteFiles([key]);
    return user;
}

export async function setAvatar(userId: number, file: Express.Multer.File | undefined): Promise<User> {
    if (!file) throw new AppError(400, 'VALIDATION_ERROR', 'Avatar image is required');
    const user = await getUser(userId);
    const previousKey = user.profile_picture;

    const key = await saveImage(file, 'avatars');
    try {
        await user.update({ profile_picture: key });
    } catch (err) {
        await deleteFiles([key]);
        throw err;
    }
    if (previousKey) await deleteFiles([previousKey]);
    return user;
}

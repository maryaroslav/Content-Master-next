import { User, Follow } from '../../models';
import { AppError } from '../../lib/errors';

export async function getUser(userId: number): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    return user;
}

export async function getUserByUsername(username: string): Promise<User> {
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

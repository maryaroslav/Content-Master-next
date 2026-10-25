import { UserEvent, Event } from '../../models';

export async function listMemberEvents(userId: number) {
    const memberships = await UserEvent.findAll({
        where: { user_id: userId },
        include: { model: Event, attributes: ['event_id', 'title', 'image', 'created_at', 'members_count'] },
    });
    return memberships.flatMap((membership) => (membership.Event ? [membership.Event] : []));
}

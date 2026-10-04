import sequelize from '../config/db';

import { User } from './User';
import { Community } from './Community';
import { UserCommunity } from './UserCommunity';
import { Event } from './Event';
import { UserEvent } from './UserEvent';
import { Follow } from './Follow';
import { Message } from './Message';
import { Post } from './Post';

const models = {
    User: User.initModel(sequelize),
    Community: Community.initModel(sequelize),
    UserCommunity: UserCommunity.initModel(sequelize),
    Event: Event.initModel(sequelize),
    UserEvent: UserEvent.initModel(sequelize),
    Follow: Follow.initModel(sequelize),
    Message: Message.initModel(sequelize),
    Post: Post.initModel(sequelize),
};

export type Models = typeof models;

Object.values(models).forEach((model) => model.associate(models));

sequelize
    .sync({ force: false })
    .then(() => {
        console.log('DB SYNC');
    })
    .catch((err: unknown) => {
        console.error('ERR SYNCing DB: ', err);
    });

export { sequelize, User, Community, UserCommunity, Event, UserEvent, Follow, Message, Post };

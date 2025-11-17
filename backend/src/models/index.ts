import { Sequelize } from 'sequelize';
import sequelize from '../config/db';

import UserModel from './User';
import CommunityModel from './Community';
import UserCommunityModel from './UserCommunity';
import EventModel from './Event';
import UserEventModel from './UserEvent';
import FollowModel from './Follow';
import MessageModel from './Message';
import PostModel from './Post';

const db: Record<string, any> = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = UserModel(sequelize);
db.Community = CommunityModel(sequelize);
db.UserCommunity = UserCommunityModel(sequelize);
db.Event = EventModel(sequelize);
db.UserEvent = UserEventModel(sequelize);
db.Follow = FollowModel(sequelize);
db.Message = MessageModel(sequelize);
db.Post = PostModel(sequelize);

Object.values(db).forEach((model) => {
    if (model && typeof model.associate === 'function') {
        model.associate(db);
    }
});

sequelize
    .sync({ force: false })
    .then(() => {
        console.log('DB SYNC');
    })
    .catch((err: unknown) => {
        console.error('ERR SYNCing DB: ', err);
    });

export default db;
import {
    Model,
    DataTypes,
    type Sequelize,
    type InferAttributes,
    type InferCreationAttributes,
    type NonAttribute,
} from 'sequelize';
import type { User } from './User';
import type { Event } from './Event';
import type { Models } from './index';

export class UserEvent extends Model<
    InferAttributes<UserEvent, { omit: 'User' | 'Event' }>,
    InferCreationAttributes<UserEvent, { omit: 'User' | 'Event' }>
> {
    declare user_id: number;
    declare event_id: number;

    declare User?: NonAttribute<User>;
    declare Event?: NonAttribute<Event>;

    static initModel(sequelize: Sequelize) {
        UserEvent.init(
            {
                user_id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    allowNull: false,
                },
                event_id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'UserEvent',
                tableName: 'users_events',
                timestamps: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_0900_ai_ci',
            }
        );
        return UserEvent;
    }

    static associate(models: Models) {
        UserEvent.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        UserEvent.belongsTo(models.Event, {
            foreignKey: 'event_id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    }
}

import {
    Model,
    DataTypes,
    type Sequelize,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
    type NonAttribute,
} from 'sequelize';
import type { User } from './User';
import type { Models } from './index';

export class Event extends Model<
    InferAttributes<Event, { omit: 'owner' | 'members' }>,
    InferCreationAttributes<Event, { omit: 'owner' | 'members' }>
> {
    declare event_id: CreationOptional<number>;
    declare title: string;
    declare description: CreationOptional<string | null>;
    declare image: string;
    declare owner_id: ForeignKey<User['user_id']>;
    declare members_count: CreationOptional<number | null>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare owner?: NonAttribute<User>;
    declare members?: NonAttribute<User[]>;

    static initModel(sequelize: Sequelize) {
        Event.init(
            {
                event_id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false,
                },
                title: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                image: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                owner_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                members_count: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    defaultValue: 0,
                },
                created_at: DataTypes.DATE,
                updated_at: DataTypes.DATE,
            },
            {
                sequelize,
                modelName: 'Event',
                tableName: 'events',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                charset: 'utf8mb4',
                collate: 'utf8mb4_0900_ai_ci',
            }
        );
        return Event;
    }

    static associate(models: Models) {
        Event.belongsTo(models.User, {
            foreignKey: 'owner_id',
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
            as: 'owner',
        });
        Event.belongsToMany(models.User, {
            through: models.UserEvent,
            foreignKey: 'event_id',
            otherKey: 'user_id',
            as: 'members',
        });
    }
}

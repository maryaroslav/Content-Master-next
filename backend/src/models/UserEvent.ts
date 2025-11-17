import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface UserEventAttributes {
    user_id: number;
    event_id: number;
}

export type UserEventCreationAttributes = Optional<UserEventAttributes, never>;

export interface UserEventInstance
    extends Model<UserEventAttributes, UserEventCreationAttributes>,
    UserEventAttributes { }

export default function UserEventModelFactory(sequelize: Sequelize) {
    const UserEvent = sequelize.define<UserEventInstance>(
        'UserEvent',
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
            tableName: 'users_events',
            timestamps: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_0900_ai_ci',
        }
    );

    (UserEvent as any).associate = (models: any) => {
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
    };

    return UserEvent;
}
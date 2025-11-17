import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface EventAttributes {
    event_id: number;
    title: string;
    description?: string | null;
    image: string;
    owner_id: number;
    members_count?: number | null;
    created_at?: Date;
    updated_at?: Date;
}

export type EventCreationAttributes = Optional<
    EventAttributes,
    'event_id' | 'description' | 'members_count' | 'created_at' | 'updated_at'
>;

export interface EventInstance
    extends Model<EventAttributes, EventCreationAttributes>,
    EventAttributes { }

export default function EventModelFactory(sequelize: Sequelize) {
    const Event = sequelize.define<EventInstance>(
        'Event',
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
        },
        {
            tableName: 'events',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8mb4',
            collate: 'utf8mb4_0900_ai_ci',
        }
    );

    // Attach associations later when all models are initialized
    (Event as any).associate = (models: any) => {
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
    };

    return Event;
}
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface CommunityAttributes {
    community_id: number;
    name: string;
    privacy: string;
    description?: string | null;
    photo: string;
    owner_id: number;
    members_count: number;
    theme: string;
    created_at?: Date;
    updated_at?: Date;
}

export type CommunityCreationAttributes = Optional<
    CommunityAttributes,
    'community_id' | 'description' | 'members_count' | 'created_at' | 'updated_at'
>;

export interface CommunityInstance
    extends Model<CommunityAttributes, CommunityCreationAttributes>,
    CommunityAttributes { }

export default function CommunityModelFactory(sequelize: Sequelize) {
    const Community = sequelize.define<CommunityInstance>(
        'Community',
        {
            community_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            privacy: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            photo: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            owner_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
            },
            members_count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            theme: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            tableName: 'communities',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            charset: 'utf8mb4',
            collate: 'utf8mb4_0900_ai_ci',
        }
    );

    // attach associations later when all models are initialized
    (Community as any).associate = (models: any) => {
        Community.belongsTo(models.User, {
            foreignKey: 'owner_id',
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
            as: 'owner',
        });

        Community.belongsToMany(models.User, {
            through: models.UserCommunity,
            foreignKey: 'community_id',
            otherKey: 'user_id',
            as: 'members',
        });
    };

    return Community;
}





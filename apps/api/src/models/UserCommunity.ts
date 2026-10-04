import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface UserCommunityAttributes {
    user_id: number;
    community_id: number;
}

export type UserCommunityCreationAttributes = Optional<UserCommunityAttributes, never>;

export interface UserCommunityInstance
    extends Model<UserCommunityAttributes, UserCommunityCreationAttributes>,
    UserCommunityAttributes { }

export default function UserCommunityModelFactory(sequelize: Sequelize) {
    const UserCommunity = sequelize.define<UserCommunityInstance>(
        'UserCommunity',
        {
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
            community_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
        },
        {
            tableName: 'users_communities',
            timestamps: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_0900_ai_ci',
        }
    );

    (UserCommunity as any).associate = (models: any) => {
        UserCommunity.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });

        UserCommunity.belongsTo(models.Community, {
            foreignKey: 'community_id',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    };

    return UserCommunity;
}
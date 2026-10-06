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

export class Community extends Model<
    InferAttributes<Community, { omit: 'owner' | 'members' }>,
    InferCreationAttributes<Community, { omit: 'owner' | 'members' }>
> {
    declare community_id: CreationOptional<number>;
    declare name: string;
    declare privacy: string;
    declare description: CreationOptional<string | null>;
    declare photo: string;
    declare owner_id: ForeignKey<User['user_id']>;
    declare members_count: CreationOptional<number>;
    declare theme: string;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare owner?: NonAttribute<User>;
    declare members?: NonAttribute<User[]>;

    static initModel(sequelize: Sequelize) {
        Community.init(
            {
                community_id: {
                    type: DataTypes.INTEGER,
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
                    type: DataTypes.INTEGER,
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
                created_at: DataTypes.DATE,
                updated_at: DataTypes.DATE,
            },
            {
                sequelize,
                modelName: 'Community',
                tableName: 'communities',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
                charset: 'utf8mb4',
                collate: 'utf8mb4_0900_ai_ci',
            }
        );
        return Community;
    }

    static associate(models: Models) {
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
    }
}

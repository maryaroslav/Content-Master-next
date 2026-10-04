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

export class Post extends Model<
    InferAttributes<Post, { omit: 'author' }>,
    InferCreationAttributes<Post, { omit: 'author' }>
> {
    declare post_id: CreationOptional<number>;
    declare title: CreationOptional<string | null>;
    declare content: CreationOptional<string | null>;
    /** Stored as a JSON array in a TEXT column (moved to its own table in migration phase 2.3). */
    declare image_url: string[];
    declare author_id: ForeignKey<User['user_id']>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare author?: NonAttribute<User>;

    static initModel(sequelize: Sequelize) {
        Post.init(
            {
                post_id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                title: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                },
                content: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                image_url: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    get(this: Post): string[] {
                        const rawValue = this.getDataValue('image_url') as unknown as string | null;
                        try {
                            return rawValue ? JSON.parse(rawValue) : [];
                        } catch {
                            return [];
                        }
                    },
                    set(this: Post, value: string[] | string) {
                        const toStore = Array.isArray(value) ? JSON.stringify(value) : value;
                        this.setDataValue('image_url', toStore as unknown as string[]);
                    },
                },
                author_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                created_at: DataTypes.DATE,
                updated_at: DataTypes.DATE,
            },
            {
                sequelize,
                modelName: 'Post',
                tableName: 'posts',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );
        return Post;
    }

    static associate(models: Models) {
        Post.belongsTo(models.User, {
            foreignKey: 'author_id',
            as: 'author',
        });
    }
}

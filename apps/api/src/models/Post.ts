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
import type { PostImage } from './PostImage';
import type { Models } from './index';

export class Post extends Model<
    InferAttributes<Post, { omit: 'author' | 'images' }>,
    InferCreationAttributes<Post, { omit: 'author' | 'images' }>
> {
    declare post_id: CreationOptional<number>;
    declare title: CreationOptional<string | null>;
    declare content: CreationOptional<string | null>;
    declare author_id: ForeignKey<User['user_id']>;
    declare created_at: CreationOptional<Date>;
    declare updated_at: CreationOptional<Date>;

    declare author?: NonAttribute<User>;
    declare images?: NonAttribute<PostImage[]>;

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
        Post.hasMany(models.PostImage, {
            foreignKey: 'post_id',
            as: 'images',
            onDelete: 'CASCADE',
        });
    }
}

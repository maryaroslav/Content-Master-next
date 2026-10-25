import {
    Model,
    DataTypes,
    type Sequelize,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    type ForeignKey,
} from 'sequelize';
import type { Post } from './Post';
import type { Models } from './index';

export class PostImage extends Model<InferAttributes<PostImage>, InferCreationAttributes<PostImage>> {
    declare id: CreationOptional<number>;
    declare post_id: ForeignKey<Post['post_id']>;
    declare image_key: string;
    declare position: number;

    static initModel(sequelize: Sequelize) {
        PostImage.init(
            {
                id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
                post_id: { type: DataTypes.INTEGER, allowNull: false },
                image_key: { type: DataTypes.STRING(255), allowNull: false },
                position: { type: DataTypes.INTEGER, allowNull: false },
            },
            {
                sequelize,
                modelName: 'PostImage',
                tableName: 'post_images',
                timestamps: false,
            }
        );
        return PostImage;
    }

    static associate(models: Models) {
        PostImage.belongsTo(models.Post, { foreignKey: 'post_id', onDelete: 'CASCADE' });
    }
}

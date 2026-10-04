import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface PostAttributes {
    post_id: number;
    title?: string | null;
    content?: string | null;
    image_url: string;
    author_id: number;
    created_at?: Date;
    updated_at?: Date;
}

export type PostCreationAttributes = Optional<
    PostAttributes,
    'post_id' | 'title' | 'content' | 'created_at' | 'updated_at'
>;

export interface PostInstance
    extends Model<PostAttributes, PostCreationAttributes>,
    PostAttributes {
    getImages(): string[];
    setImages(images: string[]): void;
}

export default function PostModelFactory(sequelize: Sequelize) {
    const Post = sequelize.define<PostInstance>(
        'Post',
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
                get(this: PostInstance) {
                    const rawValue = (this as any).getDataValue('image_url');
                    try {
                        return rawValue ? JSON.parse(rawValue) : [];
                    } catch {
                        return [];
                    }
                },
                set(this: PostInstance, value: string[] | string) {
                    const toStore = Array.isArray(value) ? JSON.stringify(value) : value;
                    (this as any).setDataValue('image_url', toStore);
                },
            },
            author_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: 'posts',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );

    (Post as any).prototype.getImages = function (this: PostInstance): string[] {
        const raw = (this as any).getDataValue('image_url') as string | null;
        try {
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    };
    (Post as any).prototype.setImages = function (this: PostInstance, images: string[]) {
        (this as any).setDataValue('image_url', JSON.stringify(images));
    };

    (Post as any).associate = (models: any) => {
        Post.belongsTo(models.User, {
            foreignKey: 'author_id',
            as: 'author',
        });
    };

    return Post;
}
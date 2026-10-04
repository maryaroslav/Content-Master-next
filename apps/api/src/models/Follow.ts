import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface FollowAttributes {
  follow_id: number;
  follower_id: number;
  following_id: number;
  created_at?: Date;
}

export type FollowCreationAttributes = Optional<FollowAttributes, 'follow_id' | 'created_at'>;

export interface FollowInstance
  extends Model<FollowAttributes, FollowCreationAttributes>,
  FollowAttributes { }

export default function FollowModelFactory(sequelize: Sequelize) {
  const Follow = sequelize.define<FollowInstance>(
    'Follow',
    {
      follow_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      following_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'follows',
      timestamps: false,
    }
  );

  (Follow as any).associate = (models: any) => {
    Follow.belongsTo(models.User, {
      foreignKey: 'follower_id',
      as: 'Follower',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    Follow.belongsTo(models.User, {
      foreignKey: 'following_id',
      as: 'Following',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Follow;
}

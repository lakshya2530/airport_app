module.exports = (sequelize, DataTypes) => {
    const PostLike = sequelize.define('PostLike', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
      tableName: 'post_likes',
      timestamps: true,
    });
  
   
    return PostLike;
  };
  
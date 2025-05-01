module.exports = (sequelize, DataTypes) => {
    const PostSave = sequelize.define('PostSave', {
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
      tableName: 'post_saves',
      timestamps: true,
    });
  

    
    return PostSave;
  };
  
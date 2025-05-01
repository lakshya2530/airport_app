// models/message.js
module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      sender_id: { type: DataTypes.INTEGER, allowNull: false },
      receiver_id: { type: DataTypes.INTEGER, allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      is_read: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {
      tableName: 'messages',
      timestamps: true,
    });
  
    return Message;
  };
  
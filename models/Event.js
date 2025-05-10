// models/Event.js
module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define("Event", {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      max_invites: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      }
      
    });
  
    // Event.associate = (models) => {
    //   Event.hasMany(models.EventEnrollment, {
    //     foreignKey: "event_id",
    //     as: "enrollments",
    //     onDelete: "CASCADE"
    //   });
    // };
  
    return Event;
  };
  
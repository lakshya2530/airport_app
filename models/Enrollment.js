module.exports = (sequelize, DataTypes) => {
    const Enrollment = sequelize.define("Enrollment", {
      user_id: DataTypes.INTEGER,
      event_id: DataTypes.INTEGER
    });
  
    // Enrollment.associate = (models) => {
    //   Enrollment.belongsTo(models.Event, { foreignKey: "event_id", as: "event" });
    // };
  
    return Enrollment;
  };
  
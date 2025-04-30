module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,  // Latitude stored as float
      allowNull: true,  // Can be null if not provided
    },
    longitude: {
      type: DataTypes.FLOAT,  // Longitude stored as float
      allowNull: true,  // Can be null if not provided
    },
    is_available: {
      type: DataTypes.BOOLEAN,  // Availability flag
      defaultValue: true,  // Default to true (user available)
    },
    name: {
      type: DataTypes.STRING,  // User's full name
      allowNull: true,  // Can be null if not provided
    },
    username: {
      type: DataTypes.STRING,  // User's username
      allowNull: true,  // Can be null if not provided
      unique: true,  // Ensure unique usernames
    },
    age: {
      type: DataTypes.INTEGER,  // User's age
      allowNull: true,  // Can be null if not provided
    },
    gender: {
      type: DataTypes.STRING,  // User's gender (e.g., male, female, etc.)
      allowNull: true,  // Can be null if not provided
    },
    bio: {
      type: DataTypes.TEXT,  // Short bio or description of the user
      allowNull: true,  // Can be null if not provided
    },
    profile_image: {
      type: DataTypes.STRING,  // Profile image URL (string to store image path)
      allowNull: true,  // Can be null if not provided
    },
  }, {
    tableName: 'users',  // Forces Sequelize to use lowercase 'users'
    timestamps: true,  // Automatically manage 'createdAt' and 'updatedAt' columns
  });

  return User;
};

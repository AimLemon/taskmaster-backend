import { Sequelize, DataTypes } from 'sequelize';
import db from '../config/database.js';

const User = db.define('users', {
  name: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  refresh_token: {
    type: DataTypes.TEXT
  }
}, {
  freezeTableName: true
});

export default User;
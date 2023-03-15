const Sequelize = require('sequelize');
const database = require('./db');
 
const Movement = database.define('movement', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    openingBalance: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    date: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    origin: {
        type: Sequelize.STRING,
        allowNull: true
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    value: {
        type: Sequelize.DOUBLE,
        allowNull: false
    }
})
 
module.exports = Movement;
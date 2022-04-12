const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo

  sequelize.define('Pokemon', {
    idbd:{
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:false,
      primaryKey: true
    },
    img:{
      type: DataTypes.TEXT,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    hp:{ type: DataTypes.INTEGER,
      allowNull: false},
    atack:{type: DataTypes.INTEGER,
      allowNull: false},
    defense:{type: DataTypes.INTEGER,
      allowNull: false},
    speed:{type: DataTypes.INTEGER,
      allowNull: false},
    height:{type: DataTypes.INTEGER,
      allowNull: false},
    width:{type: DataTypes.INTEGER,
      allowNull: false},
    createInDb:{ // indica si esta creado en la base de datos
      type:DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue:true
    }},
     {
    timestamps: false
  });
};

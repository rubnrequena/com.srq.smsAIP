const mongo = require('mongoose');

let logSq = new mongo.Schema({
  usuario:String,
  destino:String,
  contenido:String
});

module.exports = mongo.model("Log",logSq);
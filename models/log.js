const mongo = require('mongoose');

let logSq = new mongo.Schema({
  usuario:String,
  destino:String,
  contenido:mongo.Schema.Types.Mixed
});

module.exports = mongo.model("Log",logSq);
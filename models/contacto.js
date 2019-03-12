const mongo = require('mongoose');

let contactoSq = new mongo.Schema({
  agenda:mongo.Schema.Types.ObjectId,
  nombre:String,
  numero:String,
  etiquetas:String
});

module.exports = mongo.model("Contacto",contactoSq);

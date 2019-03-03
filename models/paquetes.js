const mongo = require('mongoose');

let paqSq = new mongo.Schema({
  nombre:String,
  codigo:String,
  cantidad:Number,
  duracion:Number
})

module.exports = mongo.model("Paquete",paqSq);
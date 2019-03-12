let mongo = require('mongoose');

let recargaSq = new mongo.Schema({
  destino:{type:mongo.Schema.Types.ObjectId,ref:"Usuario"},
  registro:Date,
  procesado: {
    fecha:Date,
    responsable:{type:mongo.Schema.Types.ObjectId,ref:"Usuario"}
  },
  banco:String,
  recibo:String,
  fecha:String,
  monto:{
    type:Number,
    min:100
  },
  pkg:{type:mongo.Schema.Types.ObjectId, ref:"Paquete"}
})

module.exports = mongo.model("Recarga",recargaSq);
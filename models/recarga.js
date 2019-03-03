let mongo = require('mongoose');

let recargaSq = new mongo.Schema({
  destino:{type:mongo.Schema.Types.ObjectId,ref:"Usuario"},
  registro:Date,
  recibo:String,
  monto:{
    type:Number,
    min:100
  },
  pkg:{type:mongo.Schema.Types.ObjectId, ref:"Paquete"}
})

module.exports = mongo.model("Recarga",recargaSq);
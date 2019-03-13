let mongo = require('mongoose');

var transSq = new mongo.Schema({
  origen:{
    type:mongo.Schema.Types.ObjectId,
    ref:"Usuario"
  },
  destino:{
    type:mongo.Schema.Types.ObjectId,
    ref:"Usuario"
  },
  cantidad:Number,
  fecha:Date
})

module.exports = mongo.model("Transferencia",transSq);
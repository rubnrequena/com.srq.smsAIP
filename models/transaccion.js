let mongo = require('mongoose');
const cons = require('./cons');

var transSq = new mongo.Schema({
  origen:mongo.SchemaTypes.ObjectId,
  destino:mongo.SchemaTypes.ObjectId,
  state:Number,
  valor:Number,
  modificado:Date,
  tipo:{
    type:Number,
    enum:[
      cons.TRANSACCION_TIPO_RECARGA,
      cons.TRANSACCION_TIPO_TRANSFERENCIA,
      cons.TRANSACCION_TIPO_SALDO_VENCIDO
    ]
  }
})
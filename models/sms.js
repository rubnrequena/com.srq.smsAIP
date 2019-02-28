let mongo = require('mongoose');
    
let smsSchema = new mongo.Schema({
    hash: String,
    usuario:mongo.SchemaTypes.ObjectId,
    numero:{
        type:String,
        required:true
    },
    texto:{
        type:String,
        required:true,
        maxlength:160
    },
    prioridad: {
        type:Number,
        default:0
    },
    enviado:{
     type:Number,
     default:0,
    },
    recibido:{
        type:Number,
        default:0,     
    },
    capturado:{
        type:Number,
        default:0,    
    },
    expira:{
        type:Number
    },
    minero: String
});

module.exports = mongo.model('sms',smsSchema);
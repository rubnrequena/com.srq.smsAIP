let mongo = require('mongoose');
let obID = mongo.SchemaTypes.ObjectId;

let smsSchema = new mongo.Schema({
    hash: String,
    numero:{
        type:String,
        required:true
    },
    texto:{
        type:String,
        required:true,
        maxlength:160
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
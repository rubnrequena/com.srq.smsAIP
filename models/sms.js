let mongo = require('mongoose');
    
let smsSchema = new mongo.Schema({
    hash: String,
    usuario:{type:mongo.Schema.Types.ObjectId,ref:"Usuario"},
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
        type:Date,
        default:""
    },
    recibido:Date,
    capturado:Date,
    expira:Number,
    minero: String
});
smsSchema.methods.recibidoStamp = function () {
    var d = new Date(this.recibido);
    return d.toLocaleDateString()+" "+d.toLocaleTimeString();
}
module.exports = mongo.model('sms',smsSchema);
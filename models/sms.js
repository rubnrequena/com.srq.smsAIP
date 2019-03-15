let mongo = require('mongoose');
    
let smsSchema = new mongo.Schema({
    hash: String,
    usuario:{
        type:mongo.Schema.Types.ObjectId,
        ref:"Usuario",
        required:true
    },
    numero:{
        type:String,
        required:true,
        minlength:10,
        maxlength:13,
        match:[
            /^(?:(?:\+?58\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|0?([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})$/,
            'Formato de numero invalido'
        ]
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
    enviado:Date,
    recibido:Date, 
    expira:Number,
    minado: {
        cap: Date,
        dev: String
    },
    nonce:{
        type:Number,
        get:v => Math.round(v),
        set:v => Math.round(v),
        alias:"inonce"
    }
});
smsSchema.methods.recibidoStamp = function () {
    var d = new Date(this.recibido);
    return d.toLocaleDateString()+" "+d.toLocaleTimeString();
}
module.exports = mongo.model('sms',smsSchema);
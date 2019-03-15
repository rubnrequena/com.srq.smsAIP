let Sms = require('../models/sms');
var md5 = require("md5");
var Usuario = require('../models/usuario');

module.exports = {
    sms : async (id,next,err) => {
       Sms.findById(id).then((err,sms) => {
           next(sms);
       }).catch(err);
    },
    all : async (limit) => {
        let d = await Sms.find({}).limit(limit);        
        return d;
    },
    enviar : async (user,sms) => {
        if (!user) return {code:1000,msg:"usuario no registrado"};
        if (!user.activo) return {code:1001,msg:"usuario inactivo"};
        if (user.smsDisponibles<1) return {code:1002,msg:"saldo insuficiente"};
        let s = new Sms({
            usuario:user._id,
            numero:sms.num,
            texto:sms.txt,
            recibido:new Date
        });
        s.hash = md5(s.usuario+s.numero+s.texto+s.recibido);

        user.smsDisponibles--;
        Usuario.updateOne({_id:user._id},{smsDisponibles:user.smsDisponibles},(err) => {
            if (err) return {code:404,message:err.message}; //capturar error
        })

        return await s.save().catch(err => {
           return {code:404,message:err.message};
        });
    },
    queue: async (req) => {
        let lm = parseInt(req.limit) || 10;
        let q = await Sms.find({minado:{$exists:false}}).sort({recibido:-1}).limit(lm);        
        return q;
    },
    claimReward: async (id) => {
        let sms = await Sms.updateOne({_id:id},{enviado:new Date});        
        return sms;
    }
};
let Sms = require('../models/sms');
var md5 = require("md5");
var Usuario = require('../models/usuario');

module.exports = {
    all : async (limit) => {
        let d = await Sms.find({}).limit(limit);        
        return d;
    },
    enviar : async (user,sms) => {
        if (!user) return 1000;
        if (!user.activo) return 1001;
        if (user.smsDisponibles<1) return 1002;
        let s = new Sms({
            usuario:user._id,
            numero:sms.num,
            texto:sms.txt,
            recibido:new Date
        });
        s.hash = md5(s.usuario+s.numero+s.texto+s.recibido);

        user.smsDisponibles--;
        Usuario.updateOne({_id:user._id},{smsDisponibles:user.smsDisponibles},(err,res) => {
            if (err) next(err); //capturar error
        })

        return await s.save();
    },
    queue: async (req) => {
        let lm = parseInt(req.limit) || 10;
        let q = await Sms.find({enviado:null}).sort({recibido:-1}).limit(lm);        
        return q;
    },
    claimReward: async (id) => {
        let sms = await Sms.updateOne({_id:id},{enviado:new Date});        
        return sms;
    }
};
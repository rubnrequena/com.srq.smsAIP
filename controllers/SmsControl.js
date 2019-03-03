let Sms = require('../models/sms');
var md5 = require("md5");
var Usuario = require('../models/usuario');

module.exports = {
    enviar : async (user,sms) => {
        if (!user.activo) return 1001;
        if (user.smsDisponibles<1) return 1002;
        var now = new Date();
        let s = new Sms({
            usuario:user._id,
            numero:sms.num,
            texto:sms.txt,
            recibido:now.getTime()
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
        let q = await Sms.find({enviado:0}).sort({recibido:-1}).limit(lm);        
        return q;
    },
    claimReward: async (id) => {
        let now = new Date().getTime();
        let sms = await Sms.updateOne({_id:id},{enviado:now});        
        return sms;
    }
};
let Sms = require('../models/sms');
var md5 = require("md5");

module.exports = {
    enviar : async (sms,cb) => {
        var now = new Date();
        let s = new Sms({
            numero:sms.num,
            texto:sms.txt,
            recibido:now.getTime()
        });
        s.hash = md5(s.numero+s.texto+s.recibido);
        return await s.save();
    },
    queue: async (req) => {
        let lm = parseInt(req.limit) || 10;
        let q = await Sms.find({enviado:0}).sort({recibido:-1}).limit(lm);        
        return q;
    }
};
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
    enviar : async (user,sms,next) => {
        if (!user)  return next({error:1000,msg:"usuario no registrado"});
        else { 
            if (!user.activo) return next({error:1001,msg:"usuario inactivo"})
            else {
              //validar saldo
              var smsLen = Math.ceil(user.smsDisponibles/160);
              if (user.smsDisponibles<smsLen) return next({error:1002,msg:"saldo insuficiente"})
              else {
                //TODO: remover acentos   
                let s = new Sms({
                    usuario:user._id,
                    numero:sms.num,
                    texto:sms.txt,
                    recibido:new Date
                });
                s.hash = md5(s.usuario+s.numero+s.texto+s.recibido);
                //TODO: use Fawn
                Usuario.updateOne({_id:user._id},{$inc:{smsDisponibles:smsLen*-1}},(err) => {
                    if (err) return next({error:404,message:err.message}); //capturar error
                });

                s.save()
                .then(()=> {
                  return next(null,s);
                })
                .catch(err => {
                  return next({error:404,message:err.message});
                });
              }
            }
        }
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
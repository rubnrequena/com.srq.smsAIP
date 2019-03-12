var express = require('express');
var router = express.Router();
var md5 = require("md5");
const auth = require('../config/passport');

const Usuario = require('../models/usuario');
var smsControl = require('../controllers/SmsControl');
let Sms = require('../models/sms');

/* GET home page. */
router.get('/', auth.estaAutenticado, function(req, res, next) {
    res.render("sendSMS",{usuario:req.user});
})
router.post('/',auth.estaAutenticado, async (req, res, next) => {
    if (req.user.smsDisponibles>0) {
        let sms = await smsControl.enviar(req.user,req.body);
        if (sms) {            
            res.render("sendSMS",{usuario:req.user,message:"Mensaje enviado"});
        } else next({state:1001,message:"Mensaje no enviado"})
    } else next({state:1001,message:"Mensaje no enviado, saldo insuficiente"})
})
router.get('/all',(req,res,next)=>{
    let lm = parseInt(req.query.limit) || 20;
    Sms.find({},(err,mensajes)=>{
        if (err) next(err)
        res.json(mensajes);
    }).sort({recibido:-1}).limit(lm);
})
router.get('/restore',(req,res,next)=>{
    Sms.updateMany({enviado:null},{enviado:0,$unset:{minero:false}},(err,raw)=>{
        if (err) next(err);
        res.json(raw);
    });
})
router.get('/minado/:device/:hash',(req,res,next)=>{
    Sms.findById(req.params.hash,(err,sms)=>{
        if (err) next(err)
        else {            
            if (!sms) res.json({ error:"mensaje no existe"});
            else {
                if (!sms.minado) res.json({ error:"mensaje aun en cola"});
                else {
                    if (sms.minado.dev!=req.params.device) res.json({ error:"minero invalido"});
                    else {
                        if (sms.enviado) res.json({ error:"recompensa tomada"});
                        else {            
                            sms.enviado = new Date;
                            sms.save();
                            res.json(sms);
                        }
                    }
                }
            }
        }
    })
})

router.get('/minero/:device',(req,res,next)=>{
    Sms.findOne({minado:{$exists:false}},(err,sms)=>{
        var rs = {};
        if (sms) {
            rs.code = "ok";
            rs.sms = sms;
            res.json(rs);
            sms.minado = {
                cap: new Date,
                dev: req.params.device //validar dispositivo                
            }
            sms.save();
        } else {
            rs.code="none";
            res.json(rs);
        }
    }).sort({recibido:-1});
})

router.get("/:id",(req,res,next)=>{
    Sms.findById(req.params.id,(err,sms)=>{
        res.json(sms);
    })
})

module.exports = router;
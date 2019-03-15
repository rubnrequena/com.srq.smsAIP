var express = require('express');
var router = express.Router();
const auth = require('../config/passport');

var smsControl = require('../controllers/SmsControl');
let Sms = require('../models/sms');

/* GET home page. */
router.get('/', auth.estaAutenticado, function(req, res) {
    res.render2("sendSMS");
})
router.post('/',auth.estaAutenticado, async (req, res, next) => {
    var len = req.body.num.split(",").length;
    if (req.user.smsDisponibles>len) {
        smsControl.enviar(req.user,req.body,(err) => {
            if (err) next(err)
            else res.render("sendSMS",{usuario:req.user,message:"Mensaje enviado"});
        });
        
    } else next({error:1001,message:"Mensaje no enviado, saldo insuficiente"})
})

router.get('/difusion',auth.estaAutenticado,(req,res) => {
    res.render2("sms/difusion");
})

router.get("/enviados",auth.estaAutenticado,(req,res,next) => {
    Sms.find({},(err,mensajes) => {
        if (err) next(err);
        else res.render("sms/enviados",{usuario:req.user,mensajes:mensajes});
    })
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

router.get('/minero/:device',(req,res)=>{
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

router.get("/:id",(req,res)=>{
    Sms.findById(req.params.id,(err,sms)=>{
        res.json(sms);
    })
})

module.exports = router;
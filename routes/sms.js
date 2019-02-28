var express = require('express');
var router = express.Router();
var md5 = require("md5");
const auth = require('../config/passport');

var smsControl = require('../controllers/SmsControl');
let Sms = require('../models/sms');

/* GET home page. */
router.get('/', auth.estaAutenticado, function(req, res, next) {
    res.render("sendSMS");
})
router.post('/',auth.estaAutenticado, async (req, res, next) => {
    let sms = await smsControl.enviar(req.user,req.body);
    if (sms) res.render("sendSMS",{message:"Mensaje enviado"});
    else console.log(err);
})
router.get('/all',(req,res,next)=>{
    let lm = parseInt(req.query.limit) || 20;
    Sms.find({},(err,mensajes)=>{
        if (err) console.log(err);
        res.json(mensajes);
    }).sort({recibido:-1}).limit(lm);
})
router.get('/restore',(req,res,next)=>{
    Sms.updateMany({enviado:-1},{enviado:0,$unset:{minero:false}},(err,raw)=>{
        if (err) console.log(err);
        res.json(raw);
    });
})
router.get('/minado/:hash',(req,res,next)=>{
    Sms.findById(req.params.hash,(err,sms)=>{
        if (err) console.log(err)
        else {
            if (sms) {
                //TODO validar sesion minero
                if (sms.capturado>0) {
                    sms.enviado = Date.now();
                    sms.save();
                    res.json({
                        code:1
                    });
                    //TODO guardar recomensa
                } else res.json({
                    code:0,
                    error: "message has not been sent"
                });
            } else {
                res.json({
                    code:0,
                    error:"message do not exist"
                });
            }
        }
    })
})
router.get('/minero/',(req,res,next)=>{
    Sms.findOne({enviado:0},(err,sms)=>{
        var rs = {};
        if (sms) {
            rs.code = "ok";
            rs.sms = sms;
            res.json(rs);
            //marcar como pendiente
            sms.enviado = -1;
            sms.minero = "dev";
            sms.capturado = Date.now();
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
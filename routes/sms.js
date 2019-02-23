var express = require('express');
var router = express.Router();
var md5 = require("md5");

let Sms = require('../models/sms');
var numQ = 1;

/* GET home page. */
router.get('/', function(req, res, next) {
    
});

router.get('/all',(req,res,next)=>{
    let lm = parseInt(req.query.limit) || 20;
    Sms.find({},(err,mensajes)=>{
        if (err) console.log(err);
        res.json(mensajes);
    }).sort({recibido:-1}).limit(lm);
})
router.get('/queue',(req,res,next)=>{
    let lm = parseInt(req.query.limit) || 10;
    Sms.find({enviado:0},(err,mensajes)=>{
        if (err) console.log(err);
        console.log(mensajes.length);
        res.json(mensajes);
    }).sort({recibido:-1}).limit(lm);
})
router.get('/restore',(req,res,next)=>{
    Sms.updateMany({enviado:-1},{enviado:0,$unset:{minero:false}},(err,raw)=>{
        if (err) console.log(err);
        res.json(raw);
    });
})

router.get('/add/:num/:txt',(req,res,next)=>{
    var now = new Date();
    let s = new Sms({
        numero:req.params.num,
        texto:req.params.txt+" "+numQ++,
        recibido:now.getTime()
    });
    s.hash = md5(s.numero+s.texto+s.recibido);
    s.save((err)=>{
        if (err) console.log(err);    
        else res.json(s);
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
router.get('/minero/:id',(req,res,next)=>{
    Sms.findOne({enviado:0},(err,sms)=>{
        var rs = {};
        if (sms) {
            rs.code = "ok";
            rs.sms = sms;
            res.json(rs);
            //marcar como pendiente
            sms.enviado = -1;
            sms.minero = req.params.id;
            sms.capturado = Date.now();
            sms.save();
        } else {
            rs.code="none";
            res.json(rs);
        }
    }).sort({enviadoHora:-1});
})

router.get("/:id",(req,res,next)=>{
    Sms.findById(req.params.id,(err,sms)=>{
        res.json(sms);
    })
})

module.exports = router;
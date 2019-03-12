var express = require('express');
var router = express.Router();

var smsControl = require('../controllers/SmsControl');
var Usuario = require('../models/usuario');
var Sms = require("../models/sms");

const auth = require('../config/passport');

router.get('/enviar/:key',async (req,res,next)=>{
    let u = await Usuario.findById(req.params.key);
    let sms = await smsControl.enviar(u,req.query);
    if (sms) {
        if (sms==1000) res.status(401).json({code:sms,msg:"usuario no registrado"});
        if (sms==1001) res.status(401).json({code:sms,msg:"usuario inactivo"})
        if (sms==1002) res.status(401).json({code:sms,msg:"saldo insuficiente"})
        else res.json({code:200,sms:sms});
    } else res.status(400).send({code:401,msg:"mensaje no enviado"});
})
router.get('/enviar/:num/:txt/:repetir',async (req,res,next)=>{
    let rpt = req.params.repetir || 10;
    let lote = []; let msg = req.params.txt;
    for (let i=0;i<rpt;i++) {
        req.params.txt = msg+" "+i;
        let sms = await smsControl.enviar(req.params);
        if (sms) lote.push(sms);
    }
    res.json(lote);
})

router.get('/reward/:id',async (req,res,next)=>{
    let sms = await smsControl.claimReward(req.params.id);
    res.json(sms);
})

router.get('/queue', async (req,res,next)=>{
    let r = await smsControl.queue(req.query);
    res.json(r);
})
router.get('/all', async (req,res,next) => {
    let mensajes = await smsControl.all(req.query.limit||10);
    res.json(mensajes);
})

router.get("/usuario/:id",(req,res,next) => {
    Usuario.findById(req.params.id,(err,usuario) => {
        if (err) next(err);        
        if (usuario) res.json(usuario);
        else res.json({code:1000,msg:"usuario no registrado"});
    })
})

router.get("/sms/last",auth.estaAutenticado,(req,res,next) => {
    let limit = parseInt(req.query.limit) || 10;
    let render = req.query.render || "json";
    Sms.find({usuario:req.user._id},(err,mensajes) => {
        if (err) next(err);
        else {
            if (render=="json") res.json(mensajes);
            if (render=="html") res.render('comun/smsRow',{mensajes:mensajes});
        }
    }).sort({recibido:-1}).limit(limit);
})

router.get('/sms/:id',(req,res,next) => {
    smsControl.sms(req.params.id,(err,sms) => {
        if (err) next(err);
        //if (!sms) res.json({code:404,error:"sms no existe"});
        //else res.json(sms);
    },next);
})

module.exports = router;
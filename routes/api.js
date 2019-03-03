var express = require('express');
var router = express.Router();
var smsControl = require('../controllers/SmsControl');
var Usuario = require('../models/usuario');

router.get('/enviar/:num/:txt/:key',async (req,res,next)=>{
    let u = await Usuario.findById(req.params.key);
    let sms = await smsControl.enviar(u,req.params);
    if (sms) {
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
module.exports = router;
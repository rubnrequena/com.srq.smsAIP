var express = require('express');
var router = express.Router();
var smsControl = require('../controllers/SmsControl');

router.get('/enviar/:num/:txt',async (req,res,next)=>{
    let sms = await smsControl.enviar(req.params);
    if (sms) res.json(sms);
    else console.log(err);
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
var express = require('express');
var router = express.Router();
const cors = require('cors');

var smsControl = require('../../controllers/SmsControl');
var Usuario = require('../../models/usuario');

const logs = require("../../models/log");
const contacto = require('../../models/contacto');

const auth = require('../../config/passport.js');

const smsRouter = require("./sms");

router.use("/sms",smsRouter);

router.get('/enviar/:key',async (req,res)=>{
    let u = await Usuario.findById(req.params.key);
    let sms = await smsControl.enviar(u,req.query);
    if (sms) res.json(sms);
    else res.status(400).send({code:401,msg:"mensaje no enviado"});
})
router.get('/enviar/:num/:txt/:repetir',async (req,res)=>{
    let rpt = req.params.repetir || 10;
    let lote = []; let msg = req.params.txt;
    for (let i=0;i<rpt;i++) {
        req.params.txt = msg+" "+i;
        let sms = await smsControl.enviar(req.params);
        if (sms) lote.push(sms);
    }
    res.json(lote);
})

router.get("/log",cors(),(req,res) => {
    var l = new logs({
        usuario:req.query.usuario,
        destino:req.query.numero,
        contenido:JSON.parse(req.query.contenido)
    });
    l.save((err)=>{
        if (err) res.json(err);
        else {
            res.json({message:"ok"});
        }
    })
})
router.get('/reward/:id',async (req,res)=>{
    let sms = await smsControl.claimReward(req.params.id);
    res.json(sms);
})

router.get('/queue', async (req,res)=>{
    let r = await smsControl.queue(req.query);
    res.json(r);
})
router.get('/all', async (req,res) => {
    let mensajes = await smsControl.all(req.query.limit||10);
    res.json(mensajes);
})

router.get("/contactos/",auth.estaAutenticado,(req,res) => {
    let filtro;
    let select = "nombre numero -_id";
    if (req.query.s) {
        let s = new RegExp(req.query.s,"i");
        filtro = {agenda:req.user._id,$or:[{nombre:s},{etiquetas:s}]}
    } else filtro = {agenda:req.user._id};

    contacto.find(filtro,select,(err,contactos) => {
        if (req.query.v) {
            if (req.query.v=="rowcheck") res.render("comun/contactoRowCheck",{contactos:contactos});
            else if (req.query.v=="options") res.render("comun/contactoOption",{contactos:contactos});
            else res.send(404);
        } else res.json(contactos);
    });
})

router.get("/usuario/:id",(req,res,next) => {
    Usuario.findById(req.params.id,(err,usuario) => {
        if (err) next(err);        
        if (usuario) res.json(usuario);
        else res.json({code:1000,msg:"usuario no registrado"});
    })
});

router.get("/usuario/rem/:id",auth.esSuperAdmin,(req,res,next) => {
    Usuario.findById(req.params.id,(err,us) => {
        if (err) next(err);
        else {
            //validar usuario
            if (!us) res.json({code:"error",message:"usuario no existe"});
            else {
                us.activo = false;
                us.papelera = true;
                us.papeleraMeta = {
                    tiempo:new Date,
                    resp:req.user.usuario
                };
                us.save((err) => {
                    if (err) res.json({code:"error",message:err.message});
                    else res.json({code:"ok"});
                })
            }
        }
    })
});
router.get("/usuario/res/:id",auth.esSuperAdmin,(req,res,next) => {
    Usuario.findById(req.params.id,(err,us) => {
        if (err) next(err);
        else {
            //validar usuario
            if (!us) res.json({code:"error",message:"usuario no existe"});
            else {
                us.activo = true;
                us.papelera = false;
                us.papeleraMeta = {
                    tiempo:new Date,
                    resp:req.user.usuario
                };
                us.save((err) => {
                    if (err) res.json({code:"error",message:err.message});
                    else res.json({code:"ok"});
                })
            }
        }
    })
})
module.exports = router;
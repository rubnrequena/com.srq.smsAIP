var express = require('express');
var router = express.Router();

var Usuario = require('../../models/usuario');
var Sms = require("../../models/sms");

var smsControl = require('../../controllers/SmsControl');

const auth = require("../../config/passport.js");
const moment = require('moment');

router.get("/estadisticas",async (req,res) => {
  let hoyInicio = moment().startOf('date').toISOString();
  let hoyFin = moment().endOf('date').toISOString();
  
  let mensajes = await Sms.find({enviado:{$gt:hoyInicio,$lt:hoyFin}},"usuario enviado minado").populate("usuario","tipo nombre");
  let total = mensajes.length;

  let aml=0,emp=0,otr=0;
  let grName=[], smsUsuarios={}, idx;
  let minado=0, sinMinar=0, grMin=[], mineros={}, mdx;
  mensajes.forEach(sms => {
    if (sms.usuario.tipo==="aml") aml++;
    else if (sms.usuario.tipo==="emp") emp++;
    else otr++;

    idx = grName.indexOf(sms.usuario.nombre);
    if (idx>-1) {
      smsUsuarios[sms.usuario.nombre]++; 
    } else {
      grName.push(sms.usuario.nombre);
      smsUsuarios[sms.usuario.nombre]=1;
    }
    
    if (sms.minado && sms.minado.dev) {
      minado++;
      mdx = grMin.indexOf(sms.minado.dev);
      if (mdx>-1) mineros[sms.minado.dev]++
      else {
        grMin.push(sms.minado.dev);
        mineros[sms.minado.dev]=1;
      }
    } else sinMinar++;
  });

  res.json({total,minado,sinMinar,smsUsuarios,mineros,tipo:{aml,emp,otr}});
})

router.get('/enviar/:key',async (req,res)=>{
  let u = await Usuario.findById(req.params.key);
  smsControl.enviar(u,req.query,(err,sms) => {
    if (err) res.json({message:err.message})
    else res.json(sms);
  });
});
router.get("/last",auth.estaAutenticado,(req,res,next) => {
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
      else res.json(sms);
  },next);
})
/* router.get("/bot/:repetir", async (req,res) => {
  var u = await Usuario.find();
  
  let msg = req.query.msg; let success=0, fail=0;
  var us;
  let tt = (new Date).getTime();
  for (let index = 0; index < req.params.repetir; index++) {
    var uix = parseInt(Math.random()*u.length);
    us = u[uix];
    req.query.msg = `${msg} ${index}`;
    var rsms = await smsControl.enviar(us,req.query); //actualizar smsControlEnviar(User,Body,callback(err,sms))
    if (rsms.code) fail++
    else success++;
  }
  var time = (new Date).getTime()-tt;
  res.json({success,fail,time});
});

router.get("/botmine",(req,res,next) => {
  const mineros = ["dev1","dev2","dev3"];
  let success=0, fail=0;
  minar();
  
  function minar () {
    let minero = mineros[parseInt(Math.random()*mineros.length)];
    Sms.findOne({minado:{$exists:false}},(err,sms)=>{
      var rs = {};
      if (sms) {
          sms.minado = {
              cap: new Date,
              dev: minero //validar dispositivo                
          }
          sms.enviado = new Date,
          sms.save((err) => {
            if (err) next(err);
            else {
              success++;
              minar();
            }
          });
      } else {
          rs.code="none";
          res.json({success,fail});
      }
    }).sort({recibido:-1});
  }
  
  router.get('/:id',(req,res,next) => {
    smsControl.sms(req.params.id,(err,sms) => {
        if (err) next(err);
        else {
          if (!sms) next({message:"mensaje no existe"})
          else res.json(sms);
        }
    },next);
  })
})
*/

module.exports = router;
var express = require('express');
var router = express.Router();
const passport = require('passport');
const auth = require('../config/passport');

const Usuario = require('../models/usuario');
const Recarga = require('../models/recarga');
const Paquetes = require('../models/paquetes');
const Sms = require('../models/sms');
/* GET home page. */
router.get('/', auth.estaAutenticado, function(req, res, next) {
  res.render('index', { usuario:req.user, title: 'SMSMan' });
});

router.get("/perfil",auth.estaAutenticado,async (req,res,next) => {
  let sms = await Sms.find({usuario:req.user._id});
  res.render("perfil",{usuario:req.user,mensajes:sms});
})

router.get('/registrar',auth.esSuperAdmin,(req,res,next) => {
  res.render('registrar');
})
router.post('/registrar',auth.esSuperAdmin,(req,res,next) => {
  let us = new Usuario({
    nombre:req.body.nombre,
    usuario:req.body.usuario,
    clave:req.body.clave,
    creado:new Date,
    activo:true,
    tipo:"su",
    smsDisponibles:0,
    contacto: {
      correo:req.body.correo,
      telefono:req.body.telefono
    }
  });
  us.save().then(() => {
    res.render('registrar',{ok:true});
  }).catch((err) => {
    next(err)
  })
})

router.get("/recargar",auth.esSuperAdmin,async (req,res,next) => {
  let users = await Usuario.find();
  let _recargas = await Recarga.find().populate("destino","nombre");
  res.render('recargar',{usuario:req.user,usuarios:users,recargas:_recargas});
})
router.get("/recarga/:id",auth.esSuperAdmin,async (req,res,next) => {
  var r = await Recarga.findById(req.params.id).populate("destino","nombre").populate("pkg","nombre codigo");
  res.json(r);
});
router.post("/recargar",auth.esSuperAdmin,async (req,res,next) => {
  let pkg = await Paquetes.findOne({codigo:req.body.paquete});
  let usr = await Usuario.findById(req.body.usuario);

  if (!usr) next({state:400,message:"Usuario no existe"})
  if (!pkg) next({state:400,message:"Paquete no existe"})

  var rch = new Recarga({
    destino:req.body.usuario,
    recibo:req.body.recibo,
    monto:req.body.monto,
    pkg:pkg._id,
    registro:new Date().getTime()
  });

  rch.save(async (err) => {
    if (err) next(err);

    usr.smsDisponibles += pkg.cantidad;
    await usr.save();
    let users = await Usuario.find();
    let _recargas = await Recarga.find().populate("destino","nombre");
    res.render('recargar',{msgOK:true,recargaID:rch._id,usuario:req.user,usuarios:users,recargas:_recargas});
  })
})

router.get('/login',(req,res,next) => {
  res.render('login');
})
router.post('/login',(req,res,next) => {
  return passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login'
  })(req,res,next);
})

module.exports = router;

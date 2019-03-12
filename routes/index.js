var express = require('express');
var router = express.Router();
const passport = require('passport');
const auth = require('../config/passport');
const moment = require('moment');

const Usuario = require('../models/usuario');
const Recarga = require('../models/recarga');
const Paquetes = require('../models/paquetes');
const Sms = require('../models/sms');
/* GET home page. */
router.get('/', auth.estaAutenticado, function(req, res, next) {
  res.render('index', { usuario:req.user, title: 'mSRQ' });
});

router.get("/perfil",auth.estaAutenticado,async (req,res,next) => {
  let sms = await Sms.find({usuario:req.user._id});
  var now = new Date();
  const ma = moment().startOf("month");
  const mb = moment().endOf("month");
  const wa = moment().startOf("isoWeek");
  const wb = moment().endOf("isoWeek");
  let c;
  let enviadosMes = 0, enviadosSemana = 0;
  for (let i = 0; i < sms.length; i++) {
    const s = sms[i];
    c = moment(s.recibido);
    if (c.isBetween(ma,mb)) enviadosMes++;
    if (c.isBetween(wa,wb)) enviadosSemana++;
  }
  res.render("perfil",{usuario:req.user,mensajes:sms,smsMes:enviadosMes,smsSem:enviadosSemana});
})

router.get('/registrar',(req,res,next) => {
  res.render('registrar',{usuario:req.user});
})
router.post('/registrar',(req,res,next) => {
  let us = new Usuario({
    nombre:req.body.nombre,
    usuario:req.body.usuario,
    clave:req.body.clave,
    creado:new Date,
    activo:true,
    tipo:req.body.tipo,
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
  if (!Paquetes.all) Paquetes.all = await Paquetes.find();
  res.render('recargar',{usuario:req.user,usuarios:users,
    recargas:_recargas,
    paquetes:Paquetes.all
  });
})
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
    registro:new Date()
  });

  rch.save(async (err) => {
    if (err) next(err);

    usr.smsDisponibles += pkg.cantidad;
    await usr.save();
    let users = await Usuario.find();
    let _recargas = await Recarga.find().populate("destino","nombre");
    res.render('recargar',{msgOK:true,recargaID:rch._id,usuario:req.user,usuarios:users,
      recargas:_recargas,
      paquetes:Paquetes.all
    });
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

//usuario
router.get('/recarga/solicitud',auth.estaAutenticado,(req,res,next) => {
  res.render("clientes/solicitarRecarga",{usuario:req.user});
});
router.post('/recarga/solicitud',auth.estaAutenticado,(req,res,next) => {
  
})

router.get("/recarga/:id",auth.esSuperAdmin,async (req,res,next) => {
  var r = await Recarga.findById(req.params.id).populate("destino","nombre").populate("pkg","nombre codigo");
  res.json(r);
});

module.exports = router;

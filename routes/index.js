var express = require('express');
var router = express.Router();
const passport = require('passport');
const auth = require('../config/passport');
const moment = require('moment');

const Contacto = require("../models/contacto");
const Sms = require('../models/sms');

router.get('/', auth.estaAutenticado, function(req, res, next) {
  if (req.user.tipo=="su") res.render('index', { usuario:req.user, title: 'mSRQ' });
  else {
    res.render('clientes/index', { usuario:req.user, title: 'mSRQ' });
  }
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

router.get("/contactos",auth.estaAutenticado, (req,res,next) => {
  Contacto.find({agenda:req.user._id},(err,contactos) => {
    if (err) next(err);
    else {
      res.render("contactos",{contactos:contactos,usuario:req.user});
    }
  })
})

router.post("/contactos",auth.estaAutenticado, (req,res,next) => {
  let contacto = new Contacto({
    agenda:req.user._id,
    nombre:req.body.nombre,
    numero:req.body.numero,
    etiquetas:req.body.etiquetas
  });
  contacto.save((err) => {
    if (err) next(err);
    else {
      Contacto.find({agenda:req.user._id},(err,contactos) => {
        if (err) next(err);
        else {
          res.render("contactos",{contactos:contactos,usuario:req.user});
        }
      })
    }
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
router.get("/logout",(req,res,next) => {
  req.logOut();
  res.redirect('/login')
})

module.exports = router;
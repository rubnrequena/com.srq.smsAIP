var express = require('express');
var router = express.Router();
const passport = require('passport');
const auth = require('../config/passport');

var Usuario = require('../models/usuario');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SMSMan' });
});

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

router.get("/recargar",auth.esSuperAdmin,(req,res,next) => {
  res.render('recargar');
})

router.get('/login',(req,res,next) => {
  res.render('login');
})
router.post('/login',(req,res,next) => {
  return passport.authenticate('local',{
    successRedirect: '/sms',
    failureRedirect: '/login'
  })(req,res,next);
})

module.exports = router;

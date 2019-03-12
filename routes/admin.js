var express = require('express');
var router = express.Router();

//modelos
const Usuario = require('../models/usuario');
const Recarga = require('../models/recarga');
const Paquetes = require('../models/paquetes');

const auth = require('../config/passport');
const cache = require('../config/cache');

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

router.get("/recarga/nueva",auth.esSuperAdmin,async (req,res,next) => {
  let users = await Usuario.find();
  let _recargas = await Recarga.find().populate("destino","nombre");
  res.render('admin/recargar',{usuario:req.user,usuarios:users,
    recargas:_recargas,
    paquetes:await cache.paquetes()
  });
})
router.post("/recarga/nueva",auth.esSuperAdmin,async (req,res,next) => {
  let pkg = await Paquetes.findById(req.body.paquete);
  let usr = await Usuario.findById(req.body.usuario);

  if (!usr) next({state:400,message:"Usuario no existe"})
  if (!pkg) next({state:400,message:"Paquete no existe"})

  let now = new Date;
  var rch = new Recarga({
    destino:req.body.usuario,
    recibo:req.body.recibo,
    monto:req.body.monto,
    banco:req.body.banco,
    fecha:now.toLocaleDateString(),
    pkg:pkg._id,
    registro:now,
    procesado:{
      fecha:now,
      responsable:req.user._id
    }
  });

  rch.save(async (err) => {
    if (err) next(err);

    usr.smsDisponibles += pkg.cantidad;
    await usr.save();
    let users = await Usuario.find();
    let _recargas = await Recarga.find().populate("destino","nombre");
    res.render('admin/recargar',{msgOK:true,recargaID:rch._id,usuario:req.user,usuarios:users,
      recargas:_recargas,
      paquetes:await cache.paquetes()
    });
  })
});
router.get("/recarga/solicitudes",auth.esSuperAdmin, (req,res,next) => {
  Recarga.find({procesado:{$exists:false}},(err,solicitudes) => {
    res.render("admin/solicitudes",{usuario:req.user,solicitudes:solicitudes});
  }).populate("pkg").populate("destino");
});
router.get("/recarga/confirmar/:solicitud",auth.esSuperAdmin, (req,res,next) => {
  Recarga.findById(req.params.solicitud,(err,sol) => {
    if (err) next(err);
    else {
      sol.procesado = {
        fecha:new Date,
        responsable:req.user._id
      };
      sol.save((err) => {
        if (err) next(err);
        else {
          Recarga.find({procesado:{$exists:false}},(err,solicitudes) => {
            res.render("admin/solicitudes",{ok:sol._id,usuario:req.user,solicitudes:solicitudes});
          }).populate("pkg").populate("destino");
        }
      })
    }
  });
});
router.get("/recarga/:id",auth.esSuperAdmin,async (req,res,next) => {
  var r = await Recarga.findById(req.params.id).populate("destino","nombre").populate("pkg","nombre codigo");
  res.json(r);
});
module.exports = router;
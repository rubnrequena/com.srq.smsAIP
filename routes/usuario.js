const express = require('express');
const router = express.Router();

const auth = require('../config/passport');
const cache = require('../config/cache');
const Recarga = require('../models/recarga');

/* GET users listing. */
router.get('/usuario', function(req, res, next) {
  
});
//usuario
router.get('/recarga/solicitud',auth.estaAutenticado, async (req,res,next) => {
  res.render("clientes/recargaSolicitud",{usuario:req.user,paquetes:await cache.paquetes()});
});
router.post('/recarga/solicitud',auth.estaAutenticado,(req,res,next) => {
  var recarga = new Recarga({
    destino:req.user._id,
    recibo:req.body.recibo,
    monto:req.body.monto,
    fecha:req.body.fecha,
    banco:req.body.banco,
    pkg:req.body.paquete,
    pendiente:true
  });
  recarga.save(async (err) => {
    if (err) next(err);
    else {
      res.render("clientes/recargaSolicitud",{
        ok:recarga._id,
        usuario:req.user,
        paquetes:await cache.paquetes()
      });
    }
  });
})

router.get('/recarga/historia',auth.estaAutenticado,(req,res,next) => {
  Recarga.find({destino:req.user._id},(err,_recargas) => {
    if (err) next(err);
    else {
      res.render('clientes/recargaHistoria',{usuario:req.user,recargas:_recargas});
    }
  }).populate("pkg").sort({procesado:1,registro:-1});
});

module.exports = router;

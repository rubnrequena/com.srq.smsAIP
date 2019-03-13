const express = require('express');
const router = express.Router();
const fawn = require('fawn');

const auth = require('../config/passport');
const cache = require('../config/cache');

const Recarga = require('../models/recarga');
const Usuario = require('../models/usuario');
const Transferencia = require('../models/transferencia');

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

router.get('/transferir',auth.estaAutenticado,(req,res,next) => {
  let opt = {usuario:req.user};
  res.render('clientes/transferir',opt);
});
router.post('/transferir',auth.estaAutenticado,async (req,res,next) => {  
  //validar destino
  let destino = await Usuario.findOne({usuario:req.body.destino});
  if (!destino) next({message:"Destinatario no existe"});
  else {
    if (destino.pin!=req.body.pin) next({message:"PIN incorrecto"})
    else {
      //validar disponibilidad
      if (req.user.smsDisponibles<req.body.cantidad) next({message:"Saldo insuficiente"})
      else {
        //realizar transaccion
        let cant = parseInt(req.body.cantidad);
        let nCant = cant*-1;
        let task = fawn.Task();
        task.update("usuarios",{_id:req.user._id},{$inc:{smsDisponibles:nCant}})
          .update("usuarios",{_id:destino._id},{$inc:{smsDisponibles:cant}})
          .save("transferencias",{destino:destino._id,origen:req.user._id,cantidad:cant,fecha:new Date})
          .run()
          .then((results) => {
            //responder
            let transferencia = results.pop();
            res.redirect('/usuario/transferencia/'+transferencia.insertedId);
          }).catch((err) => {
            //responder fallido
            next(err);
          })
      }
    }
  }
})
router.get("/transferencia/:recibo",(req,res,next) => {
  Transferencia.findById(req.params.recibo,(err,trans) => {
    if (err) next(error);
    else {
      res.render('clientes/transferencia',{transferencia:trans});
    }
  }).populate("destino","usuario").populate("origen","usuario");
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

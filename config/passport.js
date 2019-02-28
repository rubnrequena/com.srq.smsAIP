const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuario = require('../models/usuario');

passport.serializeUser((usuario,done) => {
  done(null,usuario._id);
});
passport.deserializeUser((id,done) => {
  Usuario.findById(id,(err,usuario) => {
    done(null,usuario);
  })
})

passport.use(new LocalStrategy({
  usernameField: 'usuario',
  passwordField: 'clave',
}, (usuario, password, done) => {
  Usuario.findOne({ usuario },(err,user) => {
    if(!user) return done(null, false, { message: 'usuario no existe' });
    else {
      user.compararClave(password,(err,sonIguales) => {
        if (sonIguales) done(null,user)
        else done(null,false,{message:"Contraseña no coincide"});
      })
    }
  })  
}));

exports.estaAutenticado = (req,res,next) => {
  if (req.isAuthenticated()) return next();
  return next({status:401,message:"No tiene autorizacion para acceder al contenido"})
}
exports.esSuperAdmin = (req,res,next) => {
  if (req.isAuthenticated() && req.user.tipo=="su") return next();
  return next({status:401,message:"No tiene autorizacion para acceder al contenido"})
}
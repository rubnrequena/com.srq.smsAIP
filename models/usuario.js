let mongo = require('mongoose');
const bcrypt = require('bcrypt');

var usuarioSq = new mongo.Schema({
  nombre:String,
  usuario:String,
  clave:String,
  creado:Date,
  activo:Boolean,
  pin:{
    type:Number,
    max:9999,
    min:1000
  },
  tipo:{
    type:String,
    enum:["su","adm","aml","emp"]
  },
  smsDisponibles:{
    type:Number,
    min:0
  },
  smsEnviados:{
    type:Number,
    min:0
  },
  recarga:{
    id:mongo.SchemaTypes.ObjectId,
    tiempo:Date
  },
  contacto:{
    telefono:String,
    correo:String
  }
})


usuarioSq.pre('save',function (next) {
  var usuario = this;
  if (!usuario.isModified("clave")) return next();

  bcrypt.genSalt(10,(err,salt) => {
    if (err) next(err);
    bcrypt.hash(usuario.clave,salt,(err,hash) => {
      if (err) next(err);
      usuario.clave = hash;
      return next();
    })
  })
});
usuarioSq.methods.compararClave = function (clave,done) {
  bcrypt.compare(clave,this.clave,(err,sonIguales) => {
      if (err) done(err);
      done(null,sonIguales);
  })
}
module.exports = mongo.model('Usuario',usuarioSq);
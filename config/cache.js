const Paquetes = require('../models/paquetes');
let _paquetes;

module.exports.modulos = {
  PAQUETES:1
}
module.exports.reset = (params) => {
  for (let i = 0; i < params.length; i++) {
    if (params[i]==PAQUETES) {_paquetes = null; continue; }
  }
}
module.exports.paquetes = async (reset=false) => {
  if (reset) _paquetes = null;
  if (!_paquetes) _paquetes = await Paquetes.find();
  return _paquetes;
}

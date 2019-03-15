const Sms = require('../models/sms');
const moment = require('moment');

module.exports.resetAfterXMinutes = 3;
module.exports.retraso = '0 */2 * * * *';
module.exports.job = async ()=> {
    let after = moment().add(this.resetAfterXMinutes,"minutes").toISOString();
    let filtro = {
        enviado:{$exists:false},
        minado:{$exists:true},
        "minado.cap":{$lt:after}
    };
    let sms = await Sms.find(filtro);
    if (sms.length>0) {
        await Sms.updateMany(filtro,{
            $unset:{minado:true},
            $inc:{nonce:1}
        });
    }
}
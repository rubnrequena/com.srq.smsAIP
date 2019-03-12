var Sms = require('../models/sms');
var n = 0;
module.exports.resetAfterXMinutes = 5;
module.exports.retraso = '0 */5 * * * *';
module.exports.job = async ()=> {
    var min5 = 1000*60*this.resetAfterXMinutes;
    var now = new Date().getTime()+min5;
    let sms = await Sms.find({minado:{$exists:true},"minado.cap":{$lt:now}});
    if (sms.length>0) {
        await Sms.updateMany({
            minado:{$exists:true},
            "minado.cap":{$lt:now}
        },{
            $unset:{minado:true}
        });
    }
}
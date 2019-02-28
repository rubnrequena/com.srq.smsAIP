var Sms = require('../models/sms');

module.exports = async ()=> {
    var min5 = 1000*5;
    var now = new Date().getTime()+min5;
    let sms = await Sms.find({enviado:-1,capturado:{$lt:now}});
    console.log(sms);
    console.log("total ",sms.length);
}
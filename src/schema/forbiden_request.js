let m =  require('mongoose')
let Schema = m.Schema
let sch = new m.Schema({
    full_path:String,
    headers:{type:Schema.Types.Mixed},
    method:String,
    request:String,
    code:String,
    ip_address:[String],
    createdAt:{type:Date, default:Date.now},
})

sch.plugin(require('mongoose-autopopulate'))

module.exports = m.model('forbiden_request', sch);
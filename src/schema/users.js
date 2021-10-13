let m =  require('mongoose')
let Schema = m.Schema
let sch = new m.Schema({
    username:String,
    password:String,
    name:String,
    email:{type:String, default:''},
    level:Number,
    phone:{type:String, default:''},
    telex_address:String,
    routing:[{type:String}],
    createdBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    createdAt:{type:Date, default:Date.now},
    deleted:{type:Number, default:0},
    deletedBy:{type: Schema.Types.ObjectId, autopopulate:{ select: 'username name email' }, ref:'user'},
    deletedAt:{type:Date},
})

sch.index({username:1},{unique:true})
sch.plugin(require('mongoose-autopopulate'))

module.exports = m.model('user',sch);
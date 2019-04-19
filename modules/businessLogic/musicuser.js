const Config = require('./../config.js');

var musicUserSchema = new Config.mongoose.Schema({
    username:{type:String,default:''},
    phone:{type:Number,default:0}
})
musicUserSchema.statics.createNewUser = function(params,callback){
    console.log("params:",params)
    this.model('musicUsers').create(params,function(err,doc){
        err?callback({code:1,msg:'网络错误'}):callback({code:1,msg:'创建成功'});
    })
}


var musicUser = Config.db.model('musicUsers',musicUserSchema,'musicusers');
module.exports = musicUser;
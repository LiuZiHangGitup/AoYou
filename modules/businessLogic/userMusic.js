const Config = require('./../config.js');

var userMusicSchema = new Config.mongoose.Schema({
    // 所屬用戶
    uid:{type:Number,default:0},
    // 用戶身份证照片
    idcardimg:{type:String,default:''},
    // 用户所拥有门票(二维码)
    havemusic:{type:Array,default:[]},
    // 用户购买门票时间
    buytime:{type:Number,default:new Date().getTime()}
})

// 查询用户所拥有门票
userMusicSchema.statics.findOneUserMenPiao = function(params,callback){
    this.model('UserMusics').findOne({uid:params.uid},function(err,doc){
        err?callback({code:0,msg:'网络错误'}):callback({code:1,data:doc});
    })
}

// 查询用户是否可购买
userMusicSchema.statics.findUserCanBuy = function(params,callback){
    this.model('UserMusics').findOne({uid:params.uid},function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            if(doc == undefined || doc == null || doc.havemusic.length == 0){
                callback({code:1,msg:'可购买'});
                return;
            }else{
                callback({code:2,msg:'不可购买'});
                return;
            }
        }
    })
}

userMusicSchema.statics.newUserMusic = function(params,callback){
    this.model('UserMusics').create(params,function(err,doc){
        err?callback({code:0,msg:'网络错误'}):callback({code:1,msg:'购买成功'});
    })
}

var userMusic = Config.db.model('UserMusics',userMusicSchema,'usermusic');
module.exports = userMusic;
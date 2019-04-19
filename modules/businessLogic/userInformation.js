const Config = require('./../config.js');

const Users = require('./../runtimes/users.js');

var userInformationSchema = new Config.mongoose.Schema({
    // uid
    uid:{type:Number,default:0},
    // 用户姓名
    name:{type:String,default:''},
    // 用户身份证
    shenfenzheng:{type:String,default:''},
    // 用户手机号
    phone:{type:Number,default:0},
    // 用户微信号
    wx:{type:String,default:''},
    // 用户支付宝号
    zhifubao:{type:String,default:''},
    // 用户银行卡号
    yinhangka:{type:String,default:''},
    // 用户上传时间
    uptime:{type:Number,default:new Date().getTime()},
    // 是否通过审核
    state:{type:Boolean,default:false},
    // 用户昵称
    nickname:{type:String,default:''}
});

// 查询一个人的具体信息
userInformationSchema.statics.findOneUser = function(params,callback){
    this.model('userInformations').findOne({uid:params.uid},function(err,doc){
        err?callback({code:0,msg:'网络错误'}):callback({code:1,data:doc});
    })
}

// 通过一条个人信息
userInformationSchema.statics.promiseOne = function(params,callback){
    this.model('userInformations').updateOne({uid:params.uid},{state:true},function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            // 修改用户个人信息状态
            Users.updateUserInformation({uid:params.uid,state:2},function(data){
                if(data.code == 1){
                    callback({code:1,msg:'修改成功'});
                }else{
                    callback({code:0,msg:'网络错误'});
                    return;
                }
            })
        }
    })
}

// 获取所有未审核信息
userInformationSchema.statics.findAllUserInformation = function(params,callback){
    this.model('userInformations').find(params).sort('-uptime').exec(function(err,doc){
        err?callback({code:0,msg:'网络错误'}):callback({code:1,data:doc})
    })
}

// 创建一条个人信息记录
userInformationSchema.statics.createUser = function(params,callback){
    var data = {
        uid:parseFloat(params.uid),
        name:params.name,
        shenfenzheng:params.shenfenzheng,
        phone:parseFloat(params.phone),
        wx:params.wx,
        zhifubao:params.zhifubao,
        yinhangka:params.yinhangka,
        uptime:new Date().getTime(),
        state:false,
        nickname:params.nickname
    }
    this.model('userInformations').create(data,function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误，提交信息失败'});
            return;
        }else{
            Users.updateUserInformation({uid:params.uid,state:1},function(data){
                if(data.code == 1){
                    callback({code:1,msg:'提交成功，等待审核'});
                }else{
                    callback({code:0,msg:'网络错误'});
                    return;
                }
            })
            
        }
    })
}

var userInformation = Config.db.model('userInformations',userInformationSchema,'userinformation');
module.exports = userInformation;
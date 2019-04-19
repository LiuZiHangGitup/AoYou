const Config = require('./../config.js');

var marketExamineSchema = new Config.mongoose.Schema({
    // 用户id
    uid:{type:Number,default:0},
    // 用户手机号
    phone:{type:Number,default:0},
    // 用户身份证正面
    idcardfront:{type:String,default:''},
    // 用户数身份证反面
    idcardreverse:{type:String,default:''},
    // 用户营业执照
    businesslicense:{type:String,default:''},
    // 用户详细地址
    address:{type:String,default:''},
    // 食品经营许可证
    foodlicensing:{type:String,default:''},
    // 用户姓名
    username:{type:String,default:''},
    // 上传时间
    uptime:{type:Number,default:new Date().getTime()},
    // 审核状态 1,2,3 1.待审核  2.已通过 3.已拒绝
    stu:{type:Number,default:1}
})

// 查询此用户是否可入驻
marketExamineSchema.statics.findUserCanRuZhu = function(params,callback){
    this.model('MarketExamines').findOne({uid:params.uid},function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            if(doc == null){
                callback({code:1,msg:'您还未进行实名认证,请前往认证。',stu:0});
                return;
            }else if(doc.stu == 2){
                callback({code:1,msg:'可以入驻',stu:2});
                return;
            }else if(doc.stu == 3){
                callback({code:1,msg:'所填信息有误,审核被拒绝,无法入驻',stu:3});
                return;
            }else if(doc.stu == 1){
                callback({code:1,msg:'请耐心等待审核',stu:1});
                return;
            } 
        }
    })
}

// 修改订单状态为通过或拒绝
marketExamineSchema.statics.updateOneExamine = function(params,callback){
    this.model('MarketExamines').updateOne({_id:params._id},{stu:params.stu},function(err,doc){
        err?callback({code:0,msg:'审核失败'}):callback({code:1,msg:'审核成功'});
    })
}

// 获取审核信息总条数
marketExamineSchema.statics.getCountMarketExamine = function(params,callback){
    this.model('MarketExamines').find(params.stu).exec(function(err,doc){
        err?callback({code:0,msg:'网络错误'}):callback({code:1,num:doc.length});
    })
}

// 后台查询所有审核信息
marketExamineSchema.statics.findAllMarketExamine = function(params,callback){
    var page = params.page;
    var pageValue = params.pageValue;
    this.model("MarketExamines").find(params.stu).sort('-uptime').skip((page-1)*pageValue).limit(pageValue).exec(function(err,doc){
        err?callback({code:0,msg:'网络错误'}):callback({code:1,data:doc});
    })
}

// 创建一条审核记录
marketExamineSchema.statics.createMarketExamine = function(params,callback){
    params.uptime = new Date().getTime();
    this.model('MarketExamines').create(params,function(err,doc){
        err?callback({code:0,msg:'网络错误,提交失败'}):callback({code:1,msg:'上传成功,等待审核'});
    })
}





var marketExamine = Config.db.model('MarketExamines',marketExamineSchema,'marketexamine');
module.exports = marketExamine;
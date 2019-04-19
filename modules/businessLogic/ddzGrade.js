//斗地主
var Config = require('./../config.js');

var ddzGradeSchema = new Config.mongoose.Schema({
    gardename:{type:String,default:''},
    grade:{type:Number,default:0},
    gardeprice:{type:Number,default:0}
});

// 添加新等级
ddzGradeSchema.statics.addOneGarde = function(params,callback){
    var _this = this;
    _this.model('ddzGrade').find({},function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            var data = {
                gardename:params.gardename,
                grade:doc.length,
                gardeprice:params.gardeprice
            }
            _this.model('ddzGrade').create(data,function(erra,doca){
                erra?callback({code:0,msg:'网络错误,添加失败'}):callback({code:1,msg:'添加成功'})
            })
        }
    })
}

// 修改单个等级信息
ddzGradeSchema.statics.changeOneGarde = function(params,callback){
    this.model('ddzGrade').updateOne({grade:params.garde},{gardename:params.gardename,gardeprice:params.gardeprice},function(err,doc){
        err?callback({code:0,msg:'修改失败'}):callback({code:1,msg:'修改成功'});
    })
}

// 查询单个等级信息
ddzGradeSchema.statics.findOneGarde = function(params,callback){
    this.model('ddzGrade').findOne({grade:params.garde},function(err,doc){
        err?callback({code:0,msg:'网络错误查询失败'}):callback({code:1,data:doc})
    })
}

// 查询所有等级
ddzGradeSchema.statics.findAllGarde = function(params,callback){
    this.model('ddzGrade').find({},function(err,doc){
        err?callback({code:0,msg:'查询失败'}):callback({code:1,msg:doc})
    })
}

// 根据用户当前等级显示用户当前等级名称
ddzGradeSchema.statics.duiYingDengJi = function(params,callback){
    this.model('ddzGrade').findOne({grade:params.grade},function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误查询用户等级失败'});
            return;
        }else{
            callback({code:1,gradename:doc.gardename,garde:doc.grade,gardeprice:doc.gardeprice});
            return;
        }
    })
}
// 判断用户升级到几级
ddzGradeSchema.statics.findUpDdzGarde = function(params,callback){
    var index = Number(params.grade)+1;
    this.model('ddzGrade').findOne({grade:index},function(err,doc){
        if(err){
            callback({code:0,msg:'网络错误'});
            return;
        }else{
            if(doc == null||doc == undefined){
                callback({code:2,msg:'您已到达最大等级'});
                return;
            }else{
                callback({code:1,gardename:doc.gardename,garde:doc.grade,gardeprice:doc.gardeprice});
                return;
            }
        }
    })
}





module.exports = Config.db.model('ddzGrade',ddzGradeSchema,'ddzgrade');

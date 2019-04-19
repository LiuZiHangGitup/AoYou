const Config = require('./../config.js');

var videoSchema = new Config.mongoose.Schema({
    // 视频缩略图
    video_img:{type:String,default:''},
    // 上传时间
    uptime:{type:String,default:''},
    // 视频单价
    price:{type:Number,default:0},
    // 视频id
    video_id:{type:Number,default:0},
    // 视频名称
    name:{type:String,default:''},
    // 前台是否显示此视频
    ifshow:{type:String,default:'true'},
    // 视频路径
    video:{type:String,default:''},
    // 播放次数
    count:{type:Number,default:0}
})

// 增加播放量
videoSchema.statics.addCount = function(params,callback){
    this.model('Videos').findOne({video_id:params.videoId},['count'],function(err,doc){
        if(err){
            callback({code:0,msg:'查询播放次数失败'});
        }else{
            doc.count++;
            doc.save(function(erra,doca){
                erra?callback({code:0,msg:'修改播放次数失败'}):callback({code:1,msg:'修改播放次数成功'});
            })
        }
    })
}

videoSchema.statics.findAllCanShow = function(params,callback){
    this.model('Videos').find({ifshow:true},function(err,doc){
        err?callback({code:0,msg:'网络错误，查询失败'}):callback({code:1,data:doc.reverse()})
    })
}

// 查询当前视频是否免费
videoSchema.statics.findThisNumIfZero = function(req,callback){
    this.model('Videos').findOne({video_id:req.videoId},['price'],function(err,doc){
        if(doc.price == 0||doc.price == 0.0){
            callback({code:1,msg:'当前此视频免费，您可观看'});
        }else{
            callback({code:0,msg:'当前视频并非免费。'});
        }
    })
}

videoSchema.statics.createNewVideo = function(params,callback){
    new Promise((reslove,rejeist) => {
        var count = 0;
        this.model('Videos').find({},function(err,doc){
            count = doc.length;
            err?rejeist():reslove(count)
        })
    }).then( (count) => {
        var newVideo = {
            video_img: params.vidImg,
            uptime: new Date().getTime(),
            name: params.vidName,
            ifshow: 'true',
            price: parseFloat(params.price),
            video_id: count+1,
            video: params.vidSrc
        }
        this.model('Videos').create(newVideo,function(err,doc){
            err?callback({code:0,msg:'上传失败'}):callback({code:1,msg:'上传成功'})
        })
    })
}

videoSchema.statics.downVideo = function(params,callback){
    this.model("Videos").updateOne({_id:params._id},{ifshow:'false'},function(err,doc){
        err?callback({code:0,msg:'下架失败'}):callback({code:1,msg:'下架成功'});
    })
}



var Video = Config.db.model('Videos',videoSchema,'videos');
module.exports = Video
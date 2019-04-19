//用户提现表
var Config = require('./../config.js')

var newSchema = new Config.mongoose.Schema({
	//type  1 == 轮播
	//      2 == 资讯链接
	type:{type:Number,default:1},
	data:{type:Array,default:{}},

})

//轮播图
// {
// 	src:'xxx'
// 	txt:'xxx'
// 	href:'xxx'
// }
//资讯
// {
// 	href:'xxx'
// 	txt:'xxx'
// }



//获取
newSchema.statics.getNews = function(callback){
	this.model('News').find({}).sort('type').exec(function(err,doc){
		callback(doc)
	})
}

//更新 {type:1,data:{xxx}}
newSchema.statics.addNews = function(req,callback){
	this.model('News').findOne({type:req.type},function(err,doc){
		doc.data.push(req)
		doc.save(function(err,doc){
			if(err){
				callback({code:0,msg:'更新失败'})
			}else{
				callback({code:1,msg:'更新成功'})
			}
		})
	})
}

//删除{type:1,data:{xxx}}
newSchema.statics.cutNews = function(req,callback){
	this.model('News').findOne({type:req.type},function(err,doc){
		var softDate = []
		doc.data.map(function(s,i,a){
			if(s.name == req.name&&s.href==req.href){

			}else{
				softDate.push(s)
			}
			if(i==a.length-1){
				doc.data = softDate
				doc.save(function(err,doc){
					if(err){
						callback({code:0})
					}else{
						callback({code:1,msg:'删除成功'})
					}
				})
			}
		})
	})
}








module.exports = Config.db.model('News',newSchema);
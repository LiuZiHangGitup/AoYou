//关于商店
var Config = require('./../config.js')
var Log = require('./logs.js')


var shopSchema = new Config.mongoose.Schema({
	//会员
	name:{type:String,default:'会员'},
	price:{type:Number,default:20},
	code:{type:Number,default:1}
})


//新建
shopSchema.statics.newShop = function(){
	this.model('Shops').create({
		price:30
	},function(){

	})
}

shopSchema.statics.getThing = function(callback){
	this.model('Shops').find({}).sort('code').exec(function(err,doc){
		callback({code:1,data:doc})
	})
}

//开通
shopSchema.statics.toBeVip = function(req,callback){
	var _this = this;
	this.model('Shops').findOne({code:req.type},function(err,docs){
		var price = docs.price;
		var levels = ['普通会员','高级会员','黄金会员','铂金会员','钻石会员']
		_this.model('Users').findOne({uid:req.uid},function(err,doc){
			if(req.type == 5&&doc.lv == 5){
				callback({code:1,msg:'操作失败，您已是'+levels[doc.lv-1]+'身份'})
			}else if(req.type == 4&&doc.lv >= 4){
				callback({code:1,msg:'操作失败，您已是'+levels[doc.lv-1]+'身份'})
			}else if(req.type == 3&&doc.lv >= 3){
				callback({code:1,msg:'操作失败，您已是'+levels[doc.lv-1]+'身份'})
			}else if(req.type == 2&&doc.lv >= 2){
				callback({code:1,msg:'操作失败，您已是'+levels[doc.lv-1]+'身份'})
			}else if(req.type == 1&&doc.lv >= 1){
				callback({code:1,msg:'操作失败，您已是'+levels[doc.lv-1]+'身份'})
			}else{
				_this.model('Shops').findOne({code:doc.lv},function(ee,dd){
					var logStr = ''
					var qs = doc.gold
					var soft;
					if(doc.lv==0){
						soft = price
					}else{
						soft = price-dd.price
					}
					doc.gold-=soft
					doc.lv=req.type
					doc.score+=soft
					if(qs>=soft){
						doc.save(function(err,doc){
							if(err){
								callback({code:0,msg:'操作异常'})
							}else{
								callback({code:1,msg:'开通成功'})
								//添加日志{uid:0,type:1,msg:'xxx'}
								//加积分

								Log.addLog({uid:req.uid,type:2,msg:docs.name+'开通,余额-'+soft+'元,积分+'+soft},function(){
									
								})
							}
						})
					}else{
						callback({code:1,msg:'操作失败，余额不足'})
					}
				})
			}
		})
	})
}

module.exports = Config.db.model('Shops',shopSchema);
// 商品相关 
var Config = require('./../config.js')
var Users = require('./users.js')
var Wearhouse = require('./wearhouse.js')

var goodSchema = new Config.mongoose.Schema({
	//商品ID、code
	code:{type:Number,default:0},
	//商品名称
	name:{type:String,default:''},
	//商品价格
	price:{type:Number,default:0},
	//商品说明
	text:{type:String,default:''},
	//发行量
	count:{type:Number,default:100},
	//已售出
	soldout:{type:Number,default:0},
	//商品种类
	type:{type:Number,default:0},
	//是否上架
	stu:{type:Boolean,default:true}
})

// {code:100,name:'商品100',price:100,text:'商品100说明',count:1000,soldout:100,tyep:1,stu:true}
//新建商品
goodSchema.statics.addGood = function(res,callback){
	this.model('Goods').create(res,function(err,doc){
		err||callback({code:1,msg:'商品添加成功'})
	})
}

//获取商品
goodSchema.statics.getGood = function(req,callback){
	this.model('Goods').find({stu:true},function(err,doc){
		err||callback({code:1,data:doc,msg:'商品获取成功'})
	})
}

//删除商品
goodSchema.statics.delGood = function(req,callback){
	this.model('Goods').remove({code:req.code},function(err,doc){
		err||callback({code:1,data:doc,msg:'商品删除成功'})
	})
}

//更新商品
goodSchema.statics.updateGood = function(req,callback){
	this.model('Goods').updateOne({code:req.code},req,function(err,doc){
		err||callback({code:1,data:doc,msg:'商品更新成功'})
	})
}

//购买商品 {uid:0,code:222,num:10}
goodSchema.statics.buyGood = function(req,callback){
	var _this = this;
	//确认可购买状态
	this.model('Goods').findOne({code:req.code,stu:true},function(err,docs){
		if(err||!docs){callback({code:0,msg:'商品异常'});return}
		if(docs.count - soldout > req.num){
			callback({code:1,msg:'购买失败,库存不足'})
			return;
		}

		var rich = docs.price*req.num   //总价
		_this.model('Users').findOne({uid:req.uid},['gold'],function(err,doc){
			if(err||!doc){callback({code:0,msg:'用户异常'});return}
			if(doc.gold<rich){
				callback({code:0,msg:'余额不足,购买失败'})
			}else{
				//减去金币 增加商品
				Users.changeRich({uid:req.uid,type:'gold',num:rich,increase:false},function(data){
					if(data.code == 1){
						//更新库存
						docs.soldout+=req.num
						docs.save(function(){
						})
						//增加物品 -- 其他的业务逻辑
						Wearhouse.addSth({_uid:doc._id,data:[{code:req.code,num:req.num}]},function(res){
							callback({code:1,msg:'购买成功'})
						})
					}
				})
			}
		})
	})
	
}















module.exports = Config.db.model('Goods',goodSchema);
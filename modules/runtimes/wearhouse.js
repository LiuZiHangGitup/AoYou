//关于仓库
var Config = require('./../config.js')

var wearhouseSchema = new Config.mongoose.Schema({
    //用户ID
    uid: { type: Number, default: 0 },
    _uid: { type: String, default: '' },
    data: [{
        //物品分类
        type: { type: Number, default: 0 },
        //物品Code
        code: { type: Number, default: 0 },
        //物品名称
        name: { type: String, default: '' },
        //物品说明
        explain: { type: String, default: '' },
        //物品数量
        num: { type: Number, default: 0 },
        //限时物品
        overdue: { type: Number, default: Date.now() * 10 },
        //物品附加
        other: { type: String, default: '' },
    }]
})



//新建仓库 {uid:1,_uid:XXX}
wearhouseSchema.statics.newWh = function(data, callback) {
    this.model('Wearhouses').create(data, function(err, doc) {
        if (doc) { callback({ code: 1, msg: '仓库表创建成功' }) }
    })
}

//玩家获取仓库 {uid:111}
wearhouseSchema.statics.getWh = function(data, callback) {
    this.model('Wearhouses').findOne(data, ["data"], function(err, doc) {
        if (doc) {
            callback({ code: 1, msg: '获取仓库成功', data: doc.data })
        } else {
            callback({ code: 0, msg: '获取仓库失败', data: doc.data })
        }
    })
}

//新增仓库数据 {_uid:xxxxx,data:[{code:111,num:100}]}
wearhouseSchema.statics.addSth = function(data, callback) {
    console.log('商品增加逻辑', data)
    this.model('Wearhouses').findOne({ _uid: data._uid }, function(err, doc) {
        if (err) {
            callback({ code: 0, msg: '新增仓库数据失败' })
        } else {
            //[true,false,true]
            console.log('二测', doc)
            var codeCont = [];
            var softData = doc.data;
            var newThing;
            if (doc.data.length == 0) {
                doc.data = data.data
                doc.save(function(err, doc) {
                    err || callback({ code: 1, msg: '物品添加成功' })
                })
                return
            }
            console.log('doc.data', doc.data)
            var scount = doc.data.length;
            doc.data.map(function(s, i, a) {
                console.log('a', a, a.length)
                data.data.map(function(s1, i1, a1) {
                    if (s.code == s1.code) {
                        codeCont[i1] = true;
                        softData[i].num += data.data[i1].num
                    } else {
                        console.log(codeCont[i1])
                        if (codeCont[i1] + '' == 'undefined') {
                            codeCont[i1] = false;
                            // newThing = Config.goods[data.data[i1].code+'']
                            // newThing.num = data.data[i1].num
                            console.log(data.data, i1)
                            softData.push(data.data[i1])
                        }
                    }
                    console.log(codeCont)
                    console.log(i, a.length, i1, a1.length)
                    if (i == scount - 1 && i1 == a1.length - 1) {
                        console.log('-----')
                        console.log(softData)
                        doc.data = softData
                        doc.save(function(err, doc2) {
                            if (doc2) {
                                callback({ code: 1, msg: '物品添加成功' })
                            } else {
                                callback({ code: 0, msg: '物品添加失败' })
                            }
                        })
                    }


                })
            })

        }
    })
}

//减去仓库物品	{_uid:xxxxx,data:[{code:111,num:100}]}
wearhouseSchema.statics.cutSth = function(data, callback) {
    var _this = this;
    this.model('Wearhouses').findOne({ _uid: data._uid }, function(err, doc) {
        if (err) {
            callback({ code: 0, msg: '物品消耗失败' })
        } else {
            var stuCont = []
            var softData = doc.data;
            doc.data.map(function(s, i, a) {
                data.data.map(function(s1, i1, a1) {
                    if (s.code == s1.code) {
                        if (softData[i].num - s1.num >= 0) {
                            stuCont[i1] = true
                            softData[i].num -= s1.num
                        } else {
                            stuCont[i1] = false
                        }

                    } else {
                        if (stuCont[i1] + '' == 'undefined') {
                            stuCont[i1] = false
                        }
                    }

                    if (i == a.length - 1 && i1 == a1.length - 1) {
                        if (stuCont.indexOf(false) == -1) {
                            doc.data = softData;
                            doc.save(function(err, doc1) {
                                if (doc1) {
                                    callback({ code: 1, msg: '物品消耗完成' })
                                } else {
                                    callback({ code: 0, msg: '物品消耗失败' })
                                }
                            })
                        } else {
                            callback({ code: 0, msg: data.data[stuCont.indexOf(false)] + "不足" })
                        }
                    }

                })
            })
        }
    })
}







module.exports = Config.db.model('Wearhouses', wearhouseSchema, "Wearhouses");
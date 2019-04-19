var mongoose = require('mongoose');

var url = "mongodb://127.0.0.1:27017/eggaytx"

var db = mongoose.connect(url,{useMongoClient: true},function(err,doc){
    err?console.log('进入失败',err):console.log('进入成功')
});

module.exports = db;
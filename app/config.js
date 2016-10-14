var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() { console.log('connected to the mongo db!'); });


var Schema = mongoose.Schema;

//links
var linkSchema = new Schema({
  url: { type: String, unique: true },
  baseUrl: String,
  code: String,
  title: String,
  visits: { type: Number, default: 0 }
});

//users
var userSchema = new Schema({
  username: { type: String, unique: true },
  password: String
});



module.exports = {
  db: db,
  userSchema: userSchema,
  linkSchema: linkSchema
};


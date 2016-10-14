var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');

db.userSchema.methods.comparePassword = function(attemptedPassword, currentPassword, callback) {
  bcrypt.compare(attemptedPassword, currentPassword, function(err, matched) {
    callback(matched);
  });
};

db.userSchema.pre('save', function(next) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
  .then(function(hash) {
    this.password = hash;
    next();
  });
});

var User = mongoose.model('User', db.userSchema);

module.exports = User;

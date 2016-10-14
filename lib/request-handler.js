var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');


exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}, function(err, links) {
    if (err) { throw err; }

    res.status(200).send(links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  Link.findOne({url: uri})
  .exec(function(err, found) {
    if (found) {
      res.status(200).send(found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        });

        newLink.save(function(err, link) {
          if (err) { 
            res.status(404).send(err);
          } else {
            res.status(200).send(link);
          }
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;


  User.findOne({username: username})
  .exec(function(err, user) {
    if (!user) {
      res.redirect('/login');
    } else {
      user.comparePassword(password, user.password, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;


  User.findOne({ username: username })
  .exec(function(err, found) {
    if (found) {
      console.log('Account already exists');
      res.redirect('/signup');
    } else {
      var newUser = new User({
        username: username,
        password: password
      });

      newUser.save(function(err, newUser) {
        if (err) {
          throw err;
        } else {
          util.createSession(req, res, newUser);   
        }
      });
    }
  });
};

exports.navToLink = function(req, res) {
  Link.findOne({code: req.params[0]}).exec(function(err, link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.visits = link.visits + 1;
      link.save(function(err, link) {
        if (err) {
          res.status(404).send(err);
        } else { 
          res.redirect(link.url);
        }
      });
    }
  });
};
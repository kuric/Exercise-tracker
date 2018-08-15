const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema= new Schema({
  userName: String
});

const User = mongoose.model('user', userSchema);



exports.isUser = (username, done) => {
    User.findOne({ userName: username}, function(err, data) {
      if (err) return done(err);
      if (data) {
        // user was already in database
        // get it, and return data    
        return done(null, data);
      } else {
        // url user not in database, return null
        return done(null, null);
      }
    });
}

exports.createNewUser = (username, done) => {
  let user = new User({ userName : username });
  user.save(function(err, data) {
    if (err) {          
      return done(err, null);
    } else {          
      return done(null, data);
    }
  });
}

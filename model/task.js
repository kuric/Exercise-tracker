const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date
});

const Task = mongoose.model('task', taskSchema);

exports.getTasks = (uName, qSkip, qLimit ,done) => {
  let username = uName || null;
  let skip = +qSkip || 0;
  let limit = +qLimit || null;

  if(username) {

    Task.find({username : username}).limit(limit).skip(skip).lean().exec((err, data) =>{
      
      if(err) return done(err);
      Task.count({}).exec(function (err, count) {
        if (err) {
            return done(err);
        }
        return done(null, {count: count, data: data});

    });
      // if(data) {
      //   // let limit = eLimit || data.length;
      //   // data = {count: data.length, log: data.slice(from, limit + from)};
      //   return done(null, data);
      // } else {
      //   return done(null, null);
      // }
    })
  } else {
    done(null, null);
  }
}
exports.createNewTask= (username, description, duration, data, done) => {
  let task = new Task({username: username, description: description, duration: duration, date:data});
  task.save((err, data) => {
    if(err) {
      return done(err, null);
    } else {
      return done(null, data);
    }
  });
}
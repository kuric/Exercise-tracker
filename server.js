const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const User = require('./model/user');
const Task = require('./model/task');
const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI, { useNewUrlParser: true })

app.use(cors())
//logger
app.use('/', (req, res, next) => {
  console.log(`${req.method}, ${req.path} - ${req.ip}`);
  next();
});
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get( '/api/exercise/log', (req,res) => {
  let username = req.query.username || null;
  let from = req.query.from || 0;
  let to = req.query.to|| null;
  let limit = req.query.limit|| null;
  let skip = to - from;
  if(!username) {
    console.error("Path `username` is required.");
    res.json({error: 'Path `username` is required.'});   
  } else {
     User.isUser(username , (err, data) => {
       if(err) {
          console.error("Error: username not found");
          res.json({error: 'username not found'});  
       } else {
         if(!data) {
           console.error("Error: username not found");
           res.json({error: 'username not found'}); 
         } else 
         Task.getTasks(username, skip, limit, (err, data) => {
         if(err) {
           console.error(err);
           res.json({error: err});
         } else {
           res.json(data);
         }
       });
       }
       
       
     });
  }
});
app.post('/api/exercise/new-user', (req, res) => {
 const newUser = req.body.username;
  
  if(!newUser) {
    console.error("Path `username` is required.");
    res.json({error: 'Path `username` is required.'});   
  } else {
    User.isUser(newUser , (err, data) => {
      if(err) {
        console.error("Error: username didn't validate");
        res.json({error: 'invalid username'});     
      } else {
        if(data) {
          res.json({username: data.userName, "_id": data._id});
        } else {
           User.createNewUser(newUser, (err, data) => {
              if(err) {
                console.error('Error: fail with database');
                console.error(err);
                res.send('Error with database.');
              } else {
                res.json({username: data.userName, "_id": data._id});
              }
            })
        }
      } 
    });
  }
});
app.post('/api/exercise/add', (req, res) => {
 const username = req.body.username || null;
 const desc = req.body.description || null;
 const duration = req.body.duration || null;
 const date = req.body.date || new Date();
  if(!username || !desc || !duration) {
    console.error("Error: Invalid form information");
    res.json({error: 'Invalid form information'});  
  } else {
    User.isUser(username , (err, data) => {
      if(err) {
        console.error(err);
        res.json({error: err});     
      } else {
        if(data) {
          Task.createNewTask(username, desc, duration, date, (err, data) => {
            if(err) {
              console.error('Error: fail with database');
              console.error(err);
              res.send('Error with database.');
            } else {
              res.json(data);
            }
          })
        } else {
          console.error("Error: username not found");
          res.json({error: 'username not found'});  
        }
       
      }
    });
    
  }

});
// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

const express = require("express")

const app = express()

const userModel = require("./models/exerciseModel").User
const exerciseModel = require("./models/exerciseModel").Exercise

app.post("/api/exercise/new-user", (req, res)=>{
    let username = req.body.username
    userModel.findOne({username: username})
    .then(user=>{
        if (user) {
            res.json({err: "username already exist"})
        }
        else {
            userModel.create({username: username})
            .then(result=>{
                res.status(201).json({_id: result._id, username: result.username})
            })
            .catch(err=>{
                res.status(401).json({err: err.message})
            })
        }
    })
})

app.post("/api/exercise/add", (req, res)=>{
    userModel.findOne({_id: req.body.userId})
    .then(user=>{
        if(user){
            let exerciseDetail = {
                userId : req.body.userId,
                description : req.body.description,
                duration: req.body.duration,
                date: req.body.date
            }
            if(!(exerciseDetail.date)) {
              exerciseDetail.date = new Date().toDateString()
            }
            exerciseModel.create(exerciseDetail)
            .then(result =>{
                user.exercise.push(result)
                user.save()
                res.status(201).json({username: user.username, _id: user._id, description: result.description , duration: result.duration ,  date: new Date(result.date).toDateString()})
            })
            .catch(err =>{
                res.status(401).json({err})
            })
        }
        else{
            res.json({err: "No user with such id"})
        }
    })
    .catch(err=>{
        res.json(err)
    })
})

app.get("/api/exercise/users", (req,res)=>{
    userModel.find()
    .select("username _id")
    // .populate("exercise", "-_id")
    .then(result=>{
        res.status(200).json(result)
    })
    .catch(err=>{
        res.status(404).json({err})
    })
})

app.get("/api/exercise/log", (req,res)=>{
    if (!req.query.userId){
        res.json({err: "You must specify a userId in req.query"})
    }
    userModel.findById(req.query.userId)
    .populate("exercise")
    .then(user=>{
        let newLog = user.exercise;
        if (req.query.from){
          newLog = newLog.filter( x =>  x.date.getTime() > new Date(req.query.from).getTime() );}
        if (req.query.to)
          newLog = newLog.filter( x => x.date.getTime() < new Date(req.query.to).getTime());
        if (req.query.limit)
          newLog = newLog.slice(0, req.query.limit > newLog.length ? newLog.length : req.query.limit);
        user.exercise = newLog;
        let temp = user.toJSON();
        temp['count'] = newLog.length;
        return temp
    })
    .then(result => res.json({log:result.exercise, _id:result._id, username: result.username, count: result.count}))
    .catch(err => res.json(err))
})
module.exports = app

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
    userModel.findById(req.query.userId)
    .then(user=>{
        let FetchedExercises = user.exercise
        if (req.query.from){
            FetchedExercises = FetchedExercises.filter(exercise =>{
                exercise.date.getTime() > new Date(req.query.from).getTime()
            })
        }
        if (req.query.to) {
            FetchedExercises = FetchedExercises.filter(exercise =>{
                exercise.date.getTime() < new Date(req.query.to).getTime()
            })
        }
        if (req.query.limit) {
            FetchedExercises = FetchedExercises
            .slice(0, req.query.limit > FetchedExercises.length ? FetchedExercises.length : req.query.limit )
        }
        user.exercise = FetchedExercises
        let tempUser = user.toJSON()
        tempUser["count"] = FetchedExercises.length
        return tempUser
    })
    .then(result => res.json(result))
    .catch(err => res.json(err))
})
module.exports = app

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
            exerciseDetail = {
                userId : req.body.userId,
                description : req.body.description,
                duration: req.body.duration,
                date: req.body.date
            }
            exerciseModel.create(exerciseDetail)
            .then(result =>{
                user.exercise.push(result)
                user.save()
                res.status(201).json({result,user})
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
    .populate("exercise", "-_id")
    .then(result=>{
        res.status(200).json({result})
    })
    .catch(err=>{
        res.status(404).json({err})
    })
})

app.get("/api/exercise/log", (req,res)=>{
    let from = req.query.from
    let to = req.query.to
    let limit = req.query.limit
    userModel.findById(req.query.userId)
    .then(user=>{
        let FetchedExercises = user.exercise
        let FetchedExercisesLength = FetchedExercises.length
        if (from){
            FetchedExercises = FetchedExercises.filter(exercise =>{
                exercise.date.getTime() > new Date(from).getTime()
            })
        }
        if (to) {
            FetchedExercises = FetchedExercises.filter(exercise =>{
                exercise.date.getTime() < new Date(to).getTime()
            })
        }
        if (limit) {
            FetchedExercises = FetchedExercises
            .slice(0, limit > FetchedExercisesLength ? FetchedExercisesLength : limit )
        }
        user.exercise = FetchedExercises
        let tempUser = user.toJSON()
        tempUser["totalExercise"] = FetchedExercisesLength
        tempUser["count"] = FetchedExercises.length
        return tempUser
    })
    .then(result => res.json(result))
    .catch(err =>{
        res.json({err})
    })
})

module.exports = app

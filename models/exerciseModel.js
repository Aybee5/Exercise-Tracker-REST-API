const mongoose = require("mongoose")
const Schema = mongoose.Schema

const userSchema = Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    exercise: [{type: Schema.Types.ObjectId, ref:'Exercise'}]
})

const exerciseSchema = Schema({
  userId: {
      type: Schema.Types.ObjectId,
      ref:'User',
      required: true,
  },
  description: {
      type: String,
      required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
      type: Date,
    default: Date.now
    }
  
})


const Exercise = module.exports = mongoose.model("Exercise", exerciseSchema)
const User = module.exports =  mongoose.model("User", userSchema)

module.exports = {
  Exercise: Exercise,
  User: User
}
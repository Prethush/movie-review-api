let mongoose = require('mongoose');
let Schema = mongoose.Schema;
require("dotenv").config();

let movieSchema = new Schema({
  title: {type: String, required: true},
  description: {type: String},
  movieId: {type: String, required: true},
  image: {type: String},
  releaseDate: {type: Date},
  cast: [{
    name: {type: String},
    image: {type: String}
  }],
  watchList: [{type: Schema.Types.ObjectId, ref: "User"}],
}, {timestamps: true});

movieSchema.methods.displayMovie = function(id = null) {
  return {
    title: this.title,
    description: this.description,
    movieId: this.movieId,
    image: this.image,
    releaseDate: this.releaseDate,
    cast: this.cast,
    watching: id ? this.watchList.includes(id) : false
  }
} 

let Movie = mongoose.model("Movie", movieSchema);
module.exports = Movie;

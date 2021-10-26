let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let reviewSchema = new Schema({
  text: {type: String, required: true},
  movieId: {type: String, required: true},
  movieImage: {type: String},
  movieName: {type: String},
  author: {
    authorId: {type: String, required: true},
    authorname: {type: String},
    rating: {type: Number}
  }
}, {timestamps: true});


let Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
let express = require('express');
let router = express.Router();
let Movie = require('../models/Movie');
let User = require('../models/User');
let auth = require('../middlewares/auth');
const Review = require('../models/Review');

//list all movies
router.get('/', async (req, res, next) => {
  try {
    let movies = await Movie.find({});
    res.status(200).json({movies: movies});
  }catch(error) {
    next(error);
  }
});

//add a movie to db
router.post('/', async (req, res, next) => {
  let movieId = req.body.movieId;
  if(movieId){
    try{
      let movie = await Movie.findOne({movieId});
      if(movie) {
        return res.status(400).json({error: {body: ["Movie is already stored in db"]}});
      }
      movie = await Movie.create(req.body);
      return res.status(200).json({movie});
    }catch(error) {
      next(error);
    }
  }
});

//list a specific movie
router.get('/:id', auth.authOptional, async (req, res, next) => {
  let {id} = req.params;
  let userId = req.user ? req.user.userId : null;
  console.log(userId);
  try{
    let movie = await Movie.findOne({movieId: id});
    if(!movie){
      return res.status(400).json({error: {body: ["No movie is available with this id"]}});
    }
    res.status(200).json({movie: movie.displayMovie(userId)});
  }catch(error) {
    next(error);
  }
});

// create a review for the movie
router.post('/:movieId/review', auth.verifyToken, async (req, res, next) => {
  let {movieId} = req.body.review;
  try {
    let user = await User.findById(req.user.userId);
    let movie = await Movie.findOne({movieId});
    req.body.review.movieImage = movie.image;
    req.body.review.movieName = movie.title;
    if(!movie) {
      return res.status(400).json({error: {body: ["No movie is available with this id"]}});
    }
    req.body.review.author.authorId = user.id;
    req.body.review.author.authorname = user.username;
    let review = await Review.create(req.body.review);
    res.status(200).json({review});
  }catch(error) {
    next(error);
  }
});

//list all the reviews for a movie
router.get('/:movieId/review', async (req, res, next) => {
  let {movieId} = req.params;
  try {
    let movie = await Movie.findOne({movieId});
    if(!movie) {
      return res.status(400).json({error: {body: ["Theres is no reviews for this search"]}});
    }
    let reviews = await Review.find({movieId});
    res.status(200).json({reviews});
  }catch(error) {
    next(error);
  }
});

//delete a review
router.delete('/:movieId/review/:id', auth.verifyToken, async (req, res, next) => {
  let {id} = req.params;
  try {
    let review = await Review.findById(id);
    if(!review) {
      return res.status(400).json({error: {body: ["Theres is no reviews with this id"]}})
    }
    review = await Review.findByIdAndDelete(id);
    res.status(200).json({msg: "review is successfully removed"});
  }catch(error) {
    next(error);
  }
});

//display movies in the watch list
router.get('/:username/watchList', async (req, res, next) => {
  let {username} = req.params;
  try {
    let user = await User.findOne({username});
    let movies = await Movie.find({watchList: {$in: [user._id]}});
    if(movies.length === 0 ) {
      return res.status(200).json({msg: "No movies in the watch List"});
    }
    res.status(200).json({movies});
  }catch(error) {
    next(error);
  }
});

//add a movie to watch list
router.post('/:movieId/addWatchList', auth.verifyToken, async (req, res, next) => {
  let {movieId} = req.params;
  let {userId} = req.user;
  try {
    let movie = await Movie.findOne({movieId});
    if(!movie) {
      return res.status(400).json({error: {body: ["Invalid movie id"]}});
    }
    if(!movie.watchList.includes(userId)) {
      movie = await Movie.findOneAndUpdate({movieId}, {$push: {watchList: userId}}, {new: true});
      return res.status(200).json({movie}); 
    }else {
      return res.status(400).json({error: {body: ["movie is already added to the favorite list"]}});
    }
    
  }catch(error) {
    next(error);
  }
});

//remove a movie from watch list
router.delete('/:movieId/addWatchList', auth.verifyToken, async (req, res, next) => {
  let {movieId} = req.params;
  let {userId} = req.user;
  try {
    let movie = await Movie.findOne({movieId});
    if(!movie) {
      return res.status(400).json({error: {body: ["Invalid movie id"]}});
    }
    if(movie.watchList.includes(userId)) {
      movie = await Movie.findOneAndUpdate({movieId}, {$pull: {watchList: userId}}, {new: true});
      return res.status(200).json({movie}); 
    }else {
      return res.status(400).json({error: {body: ["movie is not added to watch list"]}});
    }
  }catch(error) {
    next(error);
  }
});

module.exports = router;


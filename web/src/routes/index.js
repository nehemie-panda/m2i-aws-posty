var express = require('express');
var postDataService = require('../services/index');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  postDataService.list(1).then(apiResponse => {
    console.log(Object.keys(apiResponse.data))
    res.render('index', { posts: apiResponse.data.data });
  })
    .catch(err => {
      res.render('index', { data: { posts: [] } });
    })
});

router.get('/_/:id', function (req, res, next) {
  postDataService.get(req.params.id).then(respose => {
    res.render('detail', { post: respose.data });
  })
});

router.get('/_/:id/upvote', function (req, res, next) {
  const postId = req.params.id;
  postDataService.upvotePost(postId).then(respose => {
    res.redirect(`/_/${postId}`);
  })
});

router.get('/_/:id/downvote', function (req, res, next) {
  const postId = req.params.id;
  postDataService.downvotePost(postId).then(respose => {
    res.redirect(`/_/${postId}`);
  })
});

router.get("/search", function (req, res, next) {
  const keyword = req.query.keyword;
  if (!keyword) {
    return res.send("Keyword is required", 400);
  }

  const page = parseInt(req.query.page) || 1;
  postDataService.searchPost(keyword, page).then(searchResponse => {
    res.render("index", { 
      search: keyword,
      totalMatch: searchResponse.data.totalMatch,
      posts: searchResponse.data.posts,
      next: page < searchResponse.data.totalPages ? `/search?keyword=${keyword}&page=${page + 1}` : null,
      previous: page > 1 ? `/search?keyword=${keyword}&page=${page - 1}` : null
    })
  })
})

module.exports = router;

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string (replace with your actual connection string)
const uri = process.env.ME_CONFIG_MONGODB_URL;
const client = new MongoClient(uri);
const dbName = process.env.MONGO_dbName
const collectionName = process.env.MONGO_DB_COLLECTION_NAME

let db;

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Could not connect to MongoDB", error);
    process.exit(1);
  }
}

connectToMongo();

app.use(express.json());

// Paginated list of posts
app.get('/posts', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const skip = (page - 1) * limit;

  try {
    const posts = await db.collection('posts').find({}).sort({ Picture: -1, OwnerDisplayName: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    res.json({ "data": posts, "next": `/posts?page=${page + 1}`, "previous": page > 1 ? `/posts?page=${page - 1}` : null });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
});

// Search posts
app.get('/posts/search', async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) {
    return res.status(400).json({ message: "Keyword is required" });
  }


  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const skip = (page - 1) * limit;

  try {
    const totalMatch = await db.collection('posts').countDocuments({ $text: { $search: keyword } });
    const totalPages = Math.floor(totalMatch/limit);
    const posts = await db.collection('posts').find(
      { $text: { $search: keyword } },
      {
        score: { $meta: "textScore" },
        projection: { _id: 1, Title: 1, Picture: 1, LastEditorDisplayName: 1, OwnerDisplayName: 1 },
      },
    )
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .toArray();
    res.json({
      totalMatch,
      posts: posts,
      totalPages
    });
  } catch (error) {
    res.status(500).json({ message: "Error searching posts", error });
  }
});

// Get one post
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await db.collection('posts').findOne({ _id: new ObjectId(req.params.id) });
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error });
  }
});

// Upvote a post
app.post('/posts/:id/upvote', async (req, res) => {
  try {
    const result = await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { Score: 1 } }
    );
    if (result.modifiedCount === 1) {
      res.redirect(`/posts/${req.params.id}/`)
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error upvoting post", error });
  }
});

// Downvote a post
app.post('/posts/:id/downvote', async (req, res) => {
  try {
    const result = await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $inc: { Score: -1 } }
    );
    if (result.modifiedCount === 1) {
      res.redirect(`/posts/${req.params.id}/`)
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error downvoting post", error });
  }
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
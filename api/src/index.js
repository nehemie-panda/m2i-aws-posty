const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const PORT = process.env.PORT || 3000;

// MySQL connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

let pool;

// Connect to MySQL
async function connectToMySQL() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log("Connected to MySQL");
  } catch (error) {
    console.error("Could not connect to MySQL", error);
    process.exit(1);
  }
}

connectToMySQL();

app.use(express.json());

// Paginated list of posts
app.get('/posts', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const offset = (page - 1) * limit;

  try {
    const [posts] = await pool.query(
      "SELECT Id, Title, Picture, OwnerDisplayName, LastEditorDisplayName, DATE_FORMAT(CreationDate, '%W %d of %M %Y') AS CreationDate FROM posts ORDER BY CreationDate DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    res.json({ "data": posts, "next": `/posts?page=${page + 1}`, "previous": page > 1 ? `/posts?page=${page - 1}` : null });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error: error.message });
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
  const offset = (page - 1) * limit;

  try {
    const [totalMatchResult] = await pool.query(
      "SELECT COUNT(*) as count FROM posts WHERE MATCH(Title, Body, Tags) AGAINST(? IN NATURAL LANGUAGE MODE)",
      [keyword]
    );
    const totalMatch = totalMatchResult[0].count;
    const totalPages = Math.ceil(totalMatch / limit);

    const [posts] = await pool.query(
      "SELECT Id, Title, Picture, OwnerDisplayName, LastEditorDisplayName, DATE_FORMAT(CreationDate, '%W %d of %M %Y'), " +
      "MATCH(Title, Body, Tags) AGAINST(? IN NATURAL LANGUAGE MODE) as score " +
      "FROM posts WHERE MATCH(Title, Body, Tags) AGAINST(? IN NATURAL LANGUAGE MODE) " +
      "ORDER BY score DESC LIMIT ? OFFSET ?",
      [keyword, keyword, limit, offset]
    );

    res.json({
      totalMatch,
      posts,
      totalPages
    });
  } catch (error) {
    res.status(500).json({ message: "Error searching posts", error: error.message });
  }
});

// Get one post
app.get('/posts/:id', async (req, res) => {
  try {
    const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (posts.length > 0) {
      res.json(posts[0]);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error: error.message });
  }
});

// Upvote a post
app.post('/posts/:id/upvote', async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE posts SET Score = Score + 1 WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 1) {
      res.redirect(`/posts/${req.params.id}/`);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error upvoting post", error: error.message });
  }
});

// Downvote a post
app.post('/posts/:id/downvote', async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE posts SET Score = Score - 1 WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 1) {
      res.redirect(`/posts/${req.params.id}/`);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error downvoting post", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
import { query } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment/moment.js";

export const getComments = async (req, res) => {
  console.log("GET comments request received");
  console.log("Query params:", req.query);

  try {
    // Make sure postId is provided
    if (!req.query.postId) {
      return res.status(400).json("Post ID is required");
    }

    const q = `
      SELECT c.*, u.user_id AS userId, u.full_name, u.profile_picture_url 
      FROM comments AS c 
      JOIN users AS u ON u.user_id = c.user_id 
      WHERE c.post_id = $1 
      ORDER BY c.created_at DESC;
    `;
    const values = [req.query.postId];
    const result = await query(q, values);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json("Error fetching comments: " + err.message);
  }
};

export const addComment = (req, res) => {
  console.log("POST comment request received");
  console.log("Request body:", req.body);

  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    console.log("JWT userInfo:", userInfo.id);

    try {
      // Check for desc (from frontend) or comment_text
      const commentText = req.body.desc || req.body.comment_text;

      if (!commentText) {
        return res.status(400).json("Comment text is required");
      }

      if (!req.body.postId) {
        return res.status(400).json("Post ID is required");
      }

      const q = `
        INSERT INTO comments (comment_text, created_at, user_id, post_id) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *;
      `;

      const values = [
        commentText,
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        userInfo.id,
        req.body.postId,
      ];

      const result = await query(q, values);
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json("Error creating comment: " + err.message);
    }
  });
};

export const deleteComment = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const q = `
        DELETE FROM comments 
        WHERE comment_id = $1 AND user_id = $2 
        RETURNING *;
      `;
      const values = [req.params.id, userInfo.id];
      const result = await query(q, values);

      if (result.rowCount > 0) {
        res.status(200).json("Comment has been deleted.");
      } else {
        res.status(403).json("You can delete only your comment!");
      }
    } catch (err) {
      res.status(500).json("Error deleting comment: " + err.message);
    }
  });
};

export const getCommentCount = async (req, res) => {
  try {
    if (!req.query.postId) {
      return res.status(400).json("Post ID is required");
    }

    const q = `
      SELECT COUNT(*) as comment_count
      FROM comments
      WHERE post_id = $1;
    `;
    const values = [req.query.postId];
    const result = await query(q, values);
    res.status(200).json({ count: parseInt(result.rows[0].comment_count) });
  } catch (err) {
    res.status(500).json("Error fetching comment count: " + err.message);
  }
};

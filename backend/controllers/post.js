import { query } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment/moment.js";

export const getPosts = (req, res) => {
  const userId = req.query.userId;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = userId
      ? `SELECT p.*, u.user_id AS userId, u.full_name, u.profile_picture_url 
         FROM posts AS p 
         JOIN users AS u ON u.user_id = p.user_id 
         WHERE p.user_id = $1 
         ORDER BY p.created_at DESC`
      : `SELECT p.*, u.user_id AS userId, u.full_name, u.profile_picture_url 
         FROM posts AS p 
         JOIN users AS u ON u.user_id = p.user_id 
         ORDER BY p.created_at DESC`;

    const values = userId ? [userId] : [];

    query(q, values)
      .then((data) => res.status(200).json(data.rows))
      .catch((err) => res.status(500).json(err));
  });
};

export const addPost = (req, res) => {
  const userId = req.query.userId;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    console.log("JWT userInfo:", userInfo.id);

    if (!userInfo.id) {
      console.log(
        "No user_id found in token. Available fields:",
        Object.keys(userInfo)
      );
      return res.status(400).json("User ID not found in token");
    }

    try {
      const q = `
        INSERT INTO posts (user_id, content, created_at) 
        VALUES ($1, $2, $3) 
        RETURNING *;
      `;
      const values = [
        userInfo.id,
        req.body.content,
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      ];

      const result = await query(q, values);
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json("Error creating post: " + err.message);
    }
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const q = `
        DELETE FROM posts 
        WHERE post_id = $1 AND user_id = $2 
        RETURNING *;
      `;
      const values = [req.params.id, userInfo.id];

      const result = await query(q, values);
      if (result.rowCount > 0) {
        res.status(200).json("Post has been deleted.");
      } else {
        res.status(403).json("You can delete only your post");
      }
    } catch (err) {
      res.status(500).json("Error deleting post: " + err.message);
    }
  });
};

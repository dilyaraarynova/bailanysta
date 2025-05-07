import jwt from "jsonwebtoken";
import { query } from "../connect.js";

export const getUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const { rows } = await query("SELECT * FROM users WHERE user_id = $1", [
      userId,
    ]);

    if (rows.length === 0) return res.status(404).json("User not found");

    const { password_hash, ...info } = rows[0];
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

export const updateUser = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const { name, city, website, profilePic, coverPic } = req.body;

    try {
      const { rowCount } = await query(
        `UPDATE users SET full_name = $1, bio = $2, profile_picture_url = $3 WHERE user_id = $4`,
        [name, city, profilePic, userInfo.id]
      );

      if (rowCount === 0)
        return res.status(403).json("You can update only your profile!");

      res.json("Profile updated!");
    } catch (err) {
      res.status(500).json({ error: "Database error", details: err.message });
    }
  });
};

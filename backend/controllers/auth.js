import { query } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    // CHECK IF USER EXISTS
    const userQuery = "SELECT * FROM users WHERE username = $1";
    const userResult = await query(userQuery, [req.body.username]);

    if (userResult.rows.length > 0) {
      return res.status(409).json("User already exists!");
    }

    // CREATE A NEW USER
    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const insertQuery = `
      INSERT INTO users (username, email, password_hash, full_name)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id;
    `;

    const values = [
      req.body.username,
      req.body.email,
      hashedPassword,
      req.body.name,
    ];

    const insertResult = await query(insertQuery, values);
    return res
      .status(200)
      .json("User has been created with ID: " + insertResult.rows[0].user_id);
  } catch (err) {
    console.error(err);
    return res.status(500).json("Internal server error");
  }
};

export const login = (req, res) => {
  const q = "SELECT * FROM users WHERE username = $1";

  query(q, [req.body.username])
    .then((result) => {
      const data = result.rows;

      if (data.length === 0) return res.status(404).json("User not found!");

      const checkPassword = bcrypt.compareSync(
        req.body.password,
        data[0].password_hash // PostgreSQL: password_hash column
      );

      if (!checkPassword)
        return res.status(400).json("Wrong password or username!");

      const token = jwt.sign({ id: data[0].user_id }, "secretkey");

      const { password_hash, ...others } = data[0]; // PostgreSQL: password_hash column

      res
        .cookie("accessToken", token, {
          httpOnly: true,
        })
        .status(200)
        .json(others);
    })
    .catch((err) => res.status(500).json(err));
};

export const logout = (req, res) => {
  res
    .clearCookie("accessToken", {
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json("User has been logged out.");
};

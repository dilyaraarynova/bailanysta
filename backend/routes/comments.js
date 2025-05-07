import express from "express";
import {
  getComments,
  addComment,
  deleteComment,
  getCommentCount,
} from "../controllers/comment.js";

const router = express.Router();

router.post("/", addComment);
router.delete("/:id", deleteComment);

router.get("/", getComments);
router.get("/count", getCommentCount);

export default router;

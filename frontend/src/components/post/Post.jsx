import "./post.scss";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link } from "react-router-dom";
import Comments from "../comments/Comments";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Post = ({ post }) => {
  const [commentOpen, setCommentOpen] = useState(false);

  // Fetch comment count for this post
  const { data: commentCountData, isLoading: isCountLoading } = useQuery({
    queryKey: ["commentCount", post.post_id],
    queryFn: async () => {
      const res = await makeRequest.get(
        "/comments/count?postId=" + post.post_id
      );
      return res.data;
    },
  });

  // Get comment count (or show 0 if data is not loaded yet)
  const commentCount = commentCountData ? commentCountData.count : 0;

  //TEMPORARY
  const liked = false;

  return (
    <div className="post">
      <div className="container">
        <div className="user">
          <div className="userInfo">
            <img src={post.profile_picture_url} alt="" />
            <div className="details">
              <Link
                to={`/profile/${post.user_id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">{post.full_name}</span>
              </Link>
              <span className="date">
                {new Date(post.created_at).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </span>
            </div>
          </div>
          <MoreHorizIcon />
        </div>
        <div className="content">
          <p>{post.content}</p>
        </div>
        <div className="info">
          <div className="item">
            {liked ? <FavoriteOutlinedIcon /> : <FavoriteBorderOutlinedIcon />}
            12 Likes
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            {isCountLoading ? "..." : commentCount} Comments
          </div>
          <div className="item">
            <ShareOutlinedIcon />
            Share
          </div>
        </div>
        {commentOpen && <Comments postId={post.post_id} />}
      </div>
    </div>
  );
};

export default Post;

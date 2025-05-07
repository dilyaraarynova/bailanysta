import { useContext, useState } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment";

const Comments = ({ postId }) => {
  const [comment_text, setDesc] = useState("");
  const { currentUser } = useContext(AuthContext);

  const { isLoading, error, data } = useQuery({
    queryKey: ["comments", postId],

    queryFn: async () => {
      if (!postId) {
        throw new Error("Post ID is required");
      }
      const res = await makeRequest.get("/comments?postId=" + postId);
      return res.data;
    },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newComment) => {
      return makeRequest.post("/comments", newComment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["comments"]);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();
    mutation.mutate({ comment_text, postId });
    setDesc("");
  };

  return (
    <div className="comments">
      <div className="write">
        <img src={currentUser.profile_picture_url} alt="" />
        <input
          type="text"
          placeholder="write a comment"
          value={comment_text}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button onClick={handleClick}>Send</button>
      </div>
      {error
        ? "Something went wrong"
        : isLoading
        ? "loading"
        : data.map((comment) => (
            <div className="comment" key={comment.comment_id}>
              <img src={comment.profile_picture_url} alt="" />
              <div className="info">
                <span>{comment.full_name}</span> <p>{comment.comment_text}</p>
              </div>
              <span className="date">
                {moment(comment.created_at).fromNow()}{" "}
              </span>
            </div>
          ))}
    </div>
  );
};

export default Comments;

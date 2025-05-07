import "./leftBar.scss";
import FriendsIcon from "@mui/icons-material/Group";
import GroupsIcon from "@mui/icons-material/Diversity3";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

import { AuthContext } from "../../context/authContext";
import { useContext } from "react";

const LeftBar = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="user">
            <img src={currentUser.profile_picture_url} alt="" />
            <span>{currentUser.full_name}</span>
          </div>
          <div className="item">
            <FriendsIcon />
            <span>Friends</span>
          </div>
          <div className="item">
            <GroupsIcon />
            <span>Groups</span>
          </div>

          <div className="item">
            <PlayCircleIcon />
            <span>Watch</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftBar;

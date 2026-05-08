import React from "react";
import styled from "styled-components";
import { User } from "lucide-react";
import ProfileOverlay from "./ProfileOverlay";
import { useState } from "react";
const Button = ({ user }) => {
  const [open, setOpen] = useState(false);
  return (<>
    <StyledWrapper>
      <div className="profile-btn" onClick={() => setOpen(true)}>
        {user?.picture ? (
          <img src={user.picture} className="avatar" />
        ) : (
          <div className="avatar fallback">
            <User size={18} />
          </div>
        )}

        <div className="info">
          <span className="name">{user?.name || "User"}</span>
          <span className="email">{user?.email || " "}</span>
        </div>
      </div>
    </StyledWrapper>
    {open && (
      <ProfileOverlay user={user} onClose={() => setOpen(false)} />
    )}
  </>

  );
};

const StyledWrapper = styled.div`
  .profile-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(84, 76, 76, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .profile-btn:hover {
    background: rgba(0, 255, 150, 0.12);
    border: 1px solid rgba(0,255,150,0.3);
    transform: translateY(-1px);
  }

  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    object-fit: cover;
  }

  .fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #111;
    color: white;
  }

  .info {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }

  .name {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
  }

  .email {
    font-size: 11px;
    color: #aaa;
  }
`;

export default Button;
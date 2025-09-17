"use client";
import { UserContext } from "@/contextapi/UserProvider";
import React, { useContext } from "react";
import { v4 as uuidv4 } from "uuid";

const guestUid = () => {
  const guestUserId = localStorage.getItem("ap-guest-id");
  if (!guestUserId) {
    const id = uuidv4();
    localStorage.setItem("ap-guest-id", id);
    return id;
  }
  return guestUserId;
};

const UserActions = () => {
  const { userData, dispatchUserData } = useContext(UserContext);
  const getUserData = () => {
    const userInfo = JSON.parse(localStorage.getItem("ap-au-in"));
    if (
      userInfo &&
      userInfo?.lab_role &&
      userInfo.lab_role.length > 0 &&
      userInfo.carear_stage &&
      userInfo.research
    ) {
      dispatchUserData({
        type: "get_user_info",
        userInfo,
        userExists: true,
        uid: guestUid(),
      });
    }
  };
  return { getUserData };
};
export default UserActions;

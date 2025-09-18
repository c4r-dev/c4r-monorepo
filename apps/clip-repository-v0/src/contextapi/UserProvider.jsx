const { createContext, useReducer } = require("react");
const logger = require('../../../../packages/logging/logger.js');

import { useRouter } from "next/navigation";
export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const router = useRouter();
  function reducer(state, action) {
    switch (action.type) {
      case "login": {
        return {
          ...state,
          userInfo: action.userInfo,
        };
      }
      case "checkLogin": {
        const authuser = localStorage.getItem("auth-user");
        logger.app.info("Checking", JSON.parse(authuser), state);
        if (authuser) {
          return {
            ...state,
            userInfo: JSON.parse(authuser),
          };
        } else {
          router.push("/login");
        }
      }
      case "logout": {
        localStorage.removeItem("auth-user");
        router.push("/login");
        return {
          ...state,
          userInfo: null,
        };
      }
      default: {
        return state;
      }
    }
  }
  const [userData, dispatchUserData] = useReducer(reducer, {
    userInfo: null,
  });
  return (
    <UserContext.Provider value={{ userData, dispatchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

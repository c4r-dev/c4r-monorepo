"use client";
import { ClipFilterProvider } from "./ClipFilterProvider";
import { UserContextProvider } from "./UserProvider";

export const AllContextProviders = ({ children }) => {
  return (
    <UserContextProvider>
      <ClipFilterProvider>{children}</ClipFilterProvider>
    </UserContextProvider>
  );
};

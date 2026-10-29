"use client";

import { useSelector } from "react-redux";

export default function Page() {
  const { user, isLoggedIn, loading } = useSelector(
    (state) => state.auth
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <header>
      {isLoggedIn ? (
        <p>Welcome, {user.displayName || user.email}</p>
      ) : (
        <p>Please login</p>
      )}
    </header>
  );
}
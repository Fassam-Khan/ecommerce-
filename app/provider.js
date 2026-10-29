"use client";

import { Provider } from "react-redux";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { store } from "./redux/store";
import { setUser } from "./redux/authSlice";
import { auth } from "@/lib/firebase";


function AuthListener({ children }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        store.dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          })
        );
      } else {
        store.dispatch(setUser(null));
      }
    });

    return () => unsubscribe();
  }, []);

  return children;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthListener>{children}</AuthListener>
    </Provider>
  );
}
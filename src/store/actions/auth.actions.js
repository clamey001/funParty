import firebase from "../../firebase/firebase";
import { SET_USER } from "../actionTypes";

//utils

const firestore = firebase.firestore();

const setLocalStorage = state => {
  localStorage.setItem("funParty", JSON.stringify(state));
};

export const createUserDocument = async (userAuth, additionalData) => {
  if (!userAuth) return;
  const userRef = firestore.doc(`users/${userAuth.uid}`);
  const snapshot = await userRef.get();
  if (!snapshot.exists) {
    console.log(snapshot);
    const createdAt = new Date();
    try {
      await userRef.set({
        displayName: userAuth.displayName,
        email: userAuth.email,
        emailVerified: userAuth.emailVerified,
        photoURL: userAuth.photoURL,
        isAnonymous: userAuth.isAnonymous,
        uid: userAuth.uid,
        providerData: userAuth.providerData,
        createdAt,
        ...additionalData
      });
    } catch (error) {
      console.log("Error creating user", error.message);
    }
  }
  return userRef;
};

//actions

export const initAuthListener = () => async (dispatch, getState) => {
  try {
    const unsubscribe = firebase.auth().onAuthStateChanged(async userAuth => {
      if (userAuth) {
        const userRef = await createUserDocument(userAuth);
        userRef.onSnapshot(snapshot => {
          dispatch({ type: SET_USER, user: snapshot.data() });
          setLocalStorage(getState());
        });
      } else {
        dispatch({ type: SET_USER, user: null });
        setLocalStorage(getState());
      }
    });
    return unsubscribe;
  } catch (error) {
    console.log(error);
  }
};

export const userSignUp = user => async (dispatch, getState) => {
  try {
    await firebase
      .auth()
      .createUserWithEmailAndPassword(user.email, user.password);
  } catch (error) {
    console.log(error.code, error.message);
  }
};

export const userSignOut = () => async (dispatch, getState) => {
  try {
    await firebase.auth().signOut();
  } catch (error) {
    console.log(error.code, error.message);
  }
};

export const userSignIn = user => async (dispatch, getState) => {
  try {
    await firebase.auth().signInWithEmailAndPassword(user.email, user.password);
  } catch (error) {
    console.log(error.code, error.message);
  }
};

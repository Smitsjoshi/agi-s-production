import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile
} from "firebase/auth";
import { app } from "./firebase-config";

export const auth = getAuth(app);

export const signIn = async (email: string, pass: string) => {
    return await signInWithEmailAndPassword(auth, email, pass);
};

export const signUp = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential;
};

export const logOut = async () => {
    return await firebaseSignOut(auth);
};

export { onAuthStateChanged };
export type { FirebaseUser };

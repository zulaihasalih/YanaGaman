import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyBn8cucw-uEX9P8XFCLuGuL4l0xhJukVb0",
  authDomain: "yanagaman-farazfaizal.firebaseapp.com",
  databaseURL: "https://yanagaman-farazfaizal-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "yanagaman-farazfaizal",
  storageBucket: "yanagaman-farazfaizal.firebasestorage.app",
  messagingSenderId: "69005256804",
  appId: "1:69005256804:web:da0a2d52389414d7565771"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getDatabase(app)
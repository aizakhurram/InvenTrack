import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
    apiKey: "AIzaSyAfRCHatuQAxBkH6iCue_qdUiDJoYH99kg",
    authDomain: "inventrack-3e599.firebaseapp.com",
    projectId: "inventrack-3e599",
    storageBucket: "inventrack-3e599.appspot.com",
    messagingSenderId: "324894243426",
    appId: "1:324894243426:web:88acda31653da61100ef3b"
  };
  
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const storage = getStorage(app);
export { firestore, storage };

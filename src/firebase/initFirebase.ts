// var admin = require("firebase-admin");

var serviceAccount = require("../../serviceAccountKey.json");
var admin = require("firebase-admin");

export const myApp =  admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mytest-d3b9f.firebaseio.com"
});




// import { initializeApp, FirebaseApp } from 'firebase/app';


// const firebaseConfig = {
//     apiKey: process.env.API_KEY,
//     authDomain: process.env.AUTH_DOMAIN,
//     databaseURL: process.env.DATABASE_URL,
//     projectId: process.env.PROJECT_ID,
//     storageBucket: process.env.STORAGE_BUCKET,
//     messagingSenderId: process.env.MESSAGING_SENDER_ID,
//     appId: process.env.APP_ID,
//     measurementId: process.env.MEASUREMENT_ID
// };

// export const myApp: FirebaseApp = initializeApp(firebaseConfig);



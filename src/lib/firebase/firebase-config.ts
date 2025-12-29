import { initializeApp, getApps, getApp } from "firebase/app";
import { getRemoteConfig } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: "AIzaSyCSKbAL2hZ_rqBa5wzWvXLBbhI3k5ajyAs",
  authDomain: "agi-s-final.firebaseapp.com",
  projectId: "agi-s-final",
  storageBucket: "agi-s-final.firebasestorage.app",
  messagingSenderId: "12010671731",
  appId: "1:12010671731:web:dfa6f50cb7abc42ab8a406",
  measurementId: "G-C0357L2ER5"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Remote Config
const remoteConfig = getRemoteConfig(app);

// Set minimum fetch interval
remoteConfig.settings.minimumFetchIntervalMillis = 3600000;

// Set default values
remoteConfig.defaultConfig = {
  "upgrade_banner_visible": true
};

export { remoteConfig, app };
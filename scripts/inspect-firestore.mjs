import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs, collection, doc, getDoc } from 'firebase/firestore';

const projectConfig = {
  apiKey: "AIzaSyCXM0KY2tGPUQc8WavgG2kkP12Ki7Wbnk0",
  authDomain: "life-tracker-6e906.firebaseapp.com",
  projectId: "life-tracker-6e906",
  storageBucket: "life-tracker-6e906.firebasestorage.app",
  messagingSenderId: "323293841934",
  appId: "1:323293841934:web:8cfa81f90b17221e390a5f",
  measurementId: "G-0R9V3PRYCT"
};

const app = initializeApp(projectConfig);
const db = getFirestore(app);

async function inspect() {
  console.log("Checking Firestore collections...");
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    console.log(`Found ${usersSnap.size} user doc(s) in 'users' collection:`);
    usersSnap.forEach(d => {
      const data = d.data();
      console.log(`- User ID: "${d.id}"`);
      console.log(`  habits count: ${Array.isArray(data.habits) ? data.habits.length : 'none'}`);
      console.log(`  todos count: ${Array.isArray(data.todos) ? data.todos.length : 'none'}`);
      console.log(`  lastTrackerDate: ${data.lastTrackerDate}`);
      console.log(`  lastSyncedAt: ${data.lastSyncedAt || data.lastUpdated}`);
      if (Array.isArray(data.habits) && data.habits.length > 0) {
        console.log(`  sample habit:`, JSON.stringify(data.habits[0]));
      }
    });

    const dirSnap = await getDocs(collection(db, 'users_directory'));
    console.log(`\nFound ${dirSnap.size} user doc(s) in 'users_directory' collection:`);
    dirSnap.forEach(d => {
      console.log(`- Directory ID: "${d.id}", email: ${d.data().email}, role: ${d.data().role}`);
    });

  } catch (err) {
    console.error("Firestore read error:", err);
  }
  process.exit(0);
}

inspect();

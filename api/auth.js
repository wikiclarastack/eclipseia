import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req, res) {
  const { type, email, pass } = req.body;

  try {
    let user;
    if (type === 'signup') {
      user = await admin.auth().createUser({ email, password: pass });
      await admin.firestore().collection('users').doc(user.uid).set({ email, name: email.split('@')[0] });
    } else {
      user = await admin.auth().getUserByEmail(email);
    }
    
    const token = await admin.auth().createCustomToken(user.uid);
    res.status(200).json({ success: true, token });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
}

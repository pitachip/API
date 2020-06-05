const admin = require("firebase-admin");
var serviceAccountCreds = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

const connectFirebaseAuthDb = async () => {
	const firebaseConnection = await admin.initializeApp({
		credential: admin.credential.cert(serviceAccountCreds),
		databaseURL: process.env.GOOGLE_AUTH_DB_URL,
	});
	console.log(`Firebase connected: ${firebaseConnection.name}`.blue);
};

module.exports = connectFirebaseAuthDb;

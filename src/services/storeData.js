const { Firestore } = require('@google-cloud/firestore');

async function storeData(id, data) {
    try {
        const db = new Firestore({
            projectId: process.env.PROJECT_ID,
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
        });

        const predictCollection = db.collection('predictions');
        await predictCollection.doc(id).set(data);
        console.log('Data stored successfully:', id);
    } catch (error) {
        console.error('Firestore Storage Error:', error);
        throw error;
    }
}

async function getPredictionHistories() {
    try {
        const db = new Firestore({
            projectId: process.env.PROJECT_ID,
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        });

        const snapshot = await db.collection('predictions').get();

        if (snapshot.empty) {
            return [];
        }

        const histories = snapshot.docs.map(doc => ({
            id: doc.id,
            history: {
                result: doc.data().result,
                createdAt: doc.data().createdAt,
                suggestion: doc.data().suggestion,
                id: doc.id,
            },
        }));

        return histories;
    } catch (error) {
        console.error('Firestore Retrieval Error:', error);
        throw error;
    }
}

module.exports = { 
    storeData,
    getPredictionHistories,
};

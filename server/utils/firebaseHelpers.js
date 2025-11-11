const { getFirestore, FieldPath } = require('firebase-admin/firestore');

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

/**
 * Get document or throw 404 error
 */
async function getDocOrThrow(collection, docId, errorMessage) {
    const db = getFirestore();
    const doc = await db.collection(collection).doc(docId).get();
    if (!doc.exists) {
        throw new NotFoundError(errorMessage || `${collection} not found`);
    }
    return { id: doc.id, ...doc.data() };
}

/**
 * Batch get documents by IDs
 */
async function batchGetByIds(collection, ids) {
    if (!ids || ids.length === 0) return [];

    const db = getFirestore();
    const chunks = chunkArray(ids, 10); // Firestore 'in' limit
    const promises = chunks.map(chunk =>
        db.collection(collection)
            .where(FieldPath.documentId(), 'in', chunk)
            .get()
    );

    const snapshots = await Promise.all(promises);
    return snapshots.flatMap(snap =>
        snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    );
}

/**
 * Split array into chunks
 */
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

module.exports = {
    NotFoundError,
    ValidationError,
    getDocOrThrow,
    batchGetByIds,
    chunkArray
};

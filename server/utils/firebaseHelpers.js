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

/**
 * Check if document exists
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @returns {boolean} True if exists
 */
async function docExists(collection, docId) {
    const db = getFirestore();
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists;
}

/**
 * Batch delete documents
 * @param {string} collection - Collection name
 * @param {Array} docIds - Array of document IDs to delete
 */
async function batchDelete(collection, docIds) {
    if (!docIds || docIds.length === 0) return;

    const db = getFirestore();
    const batch = db.batch();
    docIds.forEach(id => {
        batch.delete(db.collection(collection).doc(id));
    });

    await batch.commit();
}

/**
 * Transaction wrapper with error handling
 * @param {Function} callback - Transaction callback function
 * @returns {*} Transaction result
 */
async function transactionWrapper(callback) {
    const db = getFirestore();
    return await db.runTransaction(async (transaction) => {
        return await callback(transaction);
    });
}

module.exports = {
    NotFoundError,
    ValidationError,
    getDocOrThrow,
    batchGetByIds,
    chunkArray,
    docExists,
    batchDelete,
    transactionWrapper
};

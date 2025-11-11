const { db, admin } = require('../config/firebase');

/**
 * Custom error classes
 */
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
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @param {string} errorMessage - Custom error message
 * @returns {Object} Document data with id
 */
async function getDocOrThrow(collection, docId, errorMessage) {
    const doc = await db.collection(collection).doc(docId).get();
    if (!doc.exists) {
        throw new NotFoundError(errorMessage || `${collection} not found`);
    }
    return { id: doc.id, ...doc.data() };
}

/**
 * Batch get documents by IDs (handles Firestore 'in' limit of 10)
 * @param {string} collection - Collection name
 * @param {Array} ids - Array of document IDs
 * @returns {Array} Array of documents with ids
 */
async function batchGetByIds(collection, ids) {
    if (!ids || ids.length === 0) return [];

    // Remove duplicates
    const uniqueIds = [...new Set(ids)];

    // Split into chunks of 10 (Firestore 'in' limit)
    const chunks = chunkArray(uniqueIds, 10);
    const promises = chunks.map(chunk =>
        db.collection(collection)
            .where(admin.firestore.FieldPath.documentId(), 'in', chunk)
            .get()
    );

    const snapshots = await Promise.all(promises);
    return snapshots.flatMap(snap =>
        snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    );
}

/**
 * Split array into chunks
 * @param {Array} array - Array to split
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
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

// Import các hàm cần thiết từ Firestore
const { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} = require('firebase-admin/firestore');

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const db = getFirestore();
    const paymentData = { ...req.body, createdAt: new Date().toISOString() };
    const newPaymentRef = await addDoc(collection(db, 'payments'), paymentData);
    res.status(201).json({ id: newPaymentRef.id, ...paymentData });
  } catch (err) {
    console.error("Create Payment Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get all payments
exports.getPayments = async (req, res) => {
  try {
    const db = getFirestore();
    const paymentsSnapshot = await getDocs(collection(db, 'payments'));

    const payments = await Promise.all(paymentsSnapshot.docs.map(async (paymentDoc) => {
      const paymentData = paymentDoc.data();
      let orderData = null;

      // Lấy thông tin order (populate order)
      if (paymentData.order_id) {
        const orderSnap = await getDoc(doc(db, 'orders', paymentData.order_id));
        if (orderSnap.exists()) {
          orderData = { id: orderSnap.id, ...orderSnap.data() };
        }
      }
      
      return { 
        id: paymentDoc.id, 
        ...paymentData,
        order: orderData,
      };
    }));

    res.status(200).json(payments);
  } catch (err) {
    console.error("Get Payments Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const db = getFirestore();
    const paymentRef = doc(db, 'payments', req.params.id);
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const paymentData = paymentSnap.data();
    let orderData = null;

    // Lấy thông tin order (populate order)
    if (paymentData.order_id) {
      const orderSnap = await getDoc(doc(db, 'orders', paymentData.order_id));
      if (orderSnap.exists()) {
        orderData = { id: orderSnap.id, ...orderSnap.data() };
      }
    }

    res.status(200).json({
      id: paymentSnap.id,
      ...paymentData,
      order: orderData,
    });

  } catch (err) {
    console.error("Get Payment By ID Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'payments', req.params.id);

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await updateDoc(docRef, req.body);
    res.status(200).json({ id: req.params.id, ...req.body });
  } catch (err) {
    console.error("Update Payment Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'payments', req.params.id);
    
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await deleteDoc(docRef);
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error("Delete Payment Error:", err);
    res.status(500).json({ error: err.message });
  }
};
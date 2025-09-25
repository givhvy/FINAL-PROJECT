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

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const db = getFirestore();
    const orderData = { ...req.body, createdAt: new Date().toISOString() };
    const newOrderRef = await addDoc(collection(db, 'orders'), orderData);
    res.status(201).json({ id: newOrderRef.id, ...orderData });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const db = getFirestore();
    const ordersSnapshot = await getDocs(collection(db, 'orders'));

    const orders = await Promise.all(ordersSnapshot.docs.map(async (orderDoc) => {
      const orderData = orderDoc.data();
      let userData = null;
      let courseData = null;

      // Lấy thông tin user (populate user)
      if (orderData.user_id) {
        const userSnap = await getDoc(doc(db, 'users', orderData.user_id));
        if (userSnap.exists()) {
          userData = { id: userSnap.id, ...userSnap.data() };
          delete userData.password;
        }
      }

      // Lấy thông tin course (populate course)
      if (orderData.course_id) {
        const courseSnap = await getDoc(doc(db, 'courses', orderData.course_id));
        if (courseSnap.exists()) {
          courseData = { id: courseSnap.id, ...courseSnap.data() };
        }
      }
      
      return { 
        id: orderDoc.id, 
        ...orderData,
        user: userData,
        course: courseData,
      };
    }));

    res.status(200).json(orders);
  } catch (err) {
    console.error("Get Orders Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const db = getFirestore();
    const orderRef = doc(db, 'orders', req.params.id);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderSnap.data();
    let userData = null;
    let courseData = null;

    // Lấy thông tin user (populate user)
    if (orderData.user_id) {
        const userSnap = await getDoc(doc(db, 'users', orderData.user_id));
        if (userSnap.exists()) {
          userData = { id: userSnap.id, ...userSnap.data() };
          delete userData.password;
        }
    }

    // Lấy thông tin course (populate course)
    if (orderData.course_id) {
        const courseSnap = await getDoc(doc(db, 'courses', orderData.course_id));
        if (courseSnap.exists()) {
          courseData = { id: courseSnap.id, ...courseSnap.data() };
        }
    }

    res.status(200).json({
      id: orderSnap.id,
      ...orderData,
      user: userData,
      course: courseData,
    });

  } catch (err) {
    console.error("Get Order By ID Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'orders', req.params.id);

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await updateDoc(docRef, req.body);
    res.status(200).json({ id: req.params.id, ...req.body });
  } catch (err) {
    console.error("Update Order Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'orders', req.params.id);
    
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await deleteDoc(docRef);
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error("Delete Order Error:", err);
    res.status(500).json({ error: err.message });
  }
};
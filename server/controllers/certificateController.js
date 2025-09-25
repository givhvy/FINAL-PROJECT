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

// Create a new certificate
exports.createCertificate = async (req, res) => {
  try {
    const db = getFirestore();
    const certificateData = { ...req.body, issuedAt: new Date().toISOString() };
    const newCertificateRef = await addDoc(collection(db, 'certificates'), certificateData);
    res.status(201).json({ id: newCertificateRef.id, ...certificateData });
  } catch (err) {
    console.error("Create Certificate Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Get all certificates
exports.getCertificates = async (req, res) => {
  try {
    const db = getFirestore();
    const certificatesSnapshot = await getDocs(collection(db, 'certificates'));

    const certificates = await Promise.all(certificatesSnapshot.docs.map(async (certDoc) => {
      const certData = certDoc.data();
      let userData = null;
      let courseData = null;

      // Lấy thông tin user (populate user)
      if (certData.user_id) {
        const userSnap = await getDoc(doc(db, 'users', certData.user_id));
        if (userSnap.exists()) {
          userData = { id: userSnap.id, ...userSnap.data() };
          delete userData.password;
        }
      }

      // Lấy thông tin course (populate course)
      if (certData.course_id) {
        const courseSnap = await getDoc(doc(db, 'courses', certData.course_id));
        if (courseSnap.exists()) {
          courseData = { id: courseSnap.id, ...courseSnap.data() };
        }
      }
      
      return { 
        id: certDoc.id, 
        ...certData,
        user: userData,
        course: courseData,
      };
    }));

    res.status(200).json(certificates);
  } catch (err) {
    console.error("Get Certificates Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get certificate by ID
exports.getCertificateById = async (req, res) => {
  try {
    const db = getFirestore();
    const certRef = doc(db, 'certificates', req.params.id);
    const certSnap = await getDoc(certRef);

    if (!certSnap.exists()) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const certData = certSnap.data();
    let userData = null;
    let courseData = null;

    // Lấy thông tin user (populate user)
    if (certData.user_id) {
        const userSnap = await getDoc(doc(db, 'users', certData.user_id));
        if (userSnap.exists()) {
          userData = { id: userSnap.id, ...userSnap.data() };
          delete userData.password;
        }
    }

    // Lấy thông tin course (populate course)
    if (certData.course_id) {
        const courseSnap = await getDoc(doc(db, 'courses', certData.course_id));
        if (courseSnap.exists()) {
          courseData = { id: courseSnap.id, ...courseSnap.data() };
        }
    }

    res.status(200).json({
      id: certSnap.id,
      ...certData,
      user: userData,
      course: courseData,
    });

  } catch (err) {
    console.error("Get Certificate By ID Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update certificate
exports.updateCertificate = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'certificates', req.params.id);

    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    await updateDoc(docRef, req.body);
    res.status(200).json({ id: req.params.id, ...req.body });
  } catch (err) {
    console.error("Update Certificate Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// Delete certificate
exports.deleteCertificate = async (req, res) => {
  try {
    const db = getFirestore();
    const docRef = doc(db, 'certificates', req.params.id);
    
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    await deleteDoc(docRef);
    res.status(200).json({ message: 'Certificate deleted successfully' });
  } catch (err) {
    console.error("Delete Certificate Error:", err);
    res.status(500).json({ error: err.message });
  }
};
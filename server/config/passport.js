const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { getFirestore } = require('firebase-admin/firestore');

module.exports = function(app) {
  // Check if Google OAuth is configured
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  console.log('🔍 Checking Google OAuth config...');
  console.log('Client ID:', googleClientId ? '✅ Found' : '❌ Missing');
  console.log('Client Secret:', googleClientSecret ? '✅ Found' : '❌ Missing');
  
  if (!googleClientId || !googleClientSecret) {
    console.warn('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file');
    console.warn('📖 See docs/GOOGLE_OAUTH_SETUP.md for setup instructions');
    return passport; // Return passport without Google strategy
  }
  
  console.log('✅ Google OAuth configured! Registering strategy...');

  // Serialize user , ghi id vào 
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const db = getFirestore();
      const userDoc = await db.collection('users').doc(id).get();
      
      if (userDoc.exists) {
        done(null, { id: userDoc.id, ...userDoc.data() });
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const db = getFirestore();
        const usersRef = db.collection('users');
        
        // Check if user already exists
        const existingUser = await usersRef
          .where('email', '==', profile.emails[0].value)
          .limit(1)
          .get();

        if (!existingUser.empty) {
          // User exists, update Google info
          const userDoc = existingUser.docs[0];
          await userDoc.ref.update({
            googleId: profile.id,
            avatarUrl: profile.photos[0]?.value || null,
            lastLogin: new Date()
          });
          
          return done(null, { id: userDoc.id, ...userDoc.data() });
        } else {
          // Create new user
          const newUser = {
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatarUrl: profile.photos[0]?.value || null,
            role: 'student', // Default role
            createdAt: new Date(),
            lastLogin: new Date(),
            provider: 'google'
          };

          const userRef = await usersRef.add(newUser);
          const createdUser = await userRef.get();
          
          return done(null, { id: createdUser.id, ...createdUser.data() });
        }
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, null);
      }
    }
  ));

  return passport;
};

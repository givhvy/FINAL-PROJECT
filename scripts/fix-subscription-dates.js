/**
 * Migration script to fix existing Pro users without subscriptionEndDate
 * Run once to update all Pro users with proper subscription end dates
 */

const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function fixSubscriptionDates() {
    const db = getFirestore();
    
    console.log('🔍 Starting subscription dates migration...\n');
    
    try {
        // Get all Pro users without subscriptionEndDate
        const usersSnapshot = await db.collection('users')
            .where('subscriptionTier', '==', 'pro')
            .get();
        
        console.log(`📊 Found ${usersSnapshot.docs.length} Pro users\n`);
        
        let updated = 0;
        let skipped = 0;
        
        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            const userId = doc.id;
            
            // Skip if already has subscriptionEndDate
            if (userData.subscriptionEndDate) {
                console.log(`⏭️  Skip ${userData.name || userData.email} - already has end date`);
                skipped++;
                continue;
            }
            
            // Calculate end date based on plan
            const subscriptionPlan = userData.subscriptionPlan || 'monthly';
            const startDate = userData.subscriptionStartDate ? new Date(userData.subscriptionStartDate) : new Date();
            const endDate = new Date(startDate);
            
            switch (subscriptionPlan) {
                case 'yearly':
                    endDate.setFullYear(endDate.getFullYear() + 1);
                    break;
                case 'quarterly':
                    endDate.setMonth(endDate.getMonth() + 3);
                    break;
                default: // monthly
                    endDate.setMonth(endDate.getMonth() + 1);
            }
            
            // Update user with end date
            await db.collection('users').doc(userId).update({
                subscriptionEndDate: endDate.toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            console.log(`✅ Updated ${userData.name || userData.email}:`);
            console.log(`   Plan: ${subscriptionPlan}`);
            console.log(`   Start: ${startDate.toISOString().split('T')[0]}`);
            console.log(`   End: ${endDate.toISOString().split('T')[0]}\n`);
            
            updated++;
        }
        
        console.log('\n📈 Migration Summary:');
        console.log(`   ✅ Updated: ${updated}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   📊 Total: ${updated + skipped}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
    
    process.exit(0);
}

// Run migration
fixSubscriptionDates();

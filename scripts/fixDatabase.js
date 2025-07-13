const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../config.env' });

const fixDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://uditchauhan621:T2wCd83acxZqOEhj@cluster0.b27wbeb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB successfully!');
    
    const db = mongoose.connection.db;
    
    // Drop existing collections to remove old indexes
    console.log('Dropping existing collections...');
    try {
      await db.dropCollection('users');
      console.log('✓ Dropped users collection');
    } catch (error) {
      console.log('Users collection does not exist or already dropped');
    }
    
    try {
      await db.dropCollection('events');
      console.log('✓ Dropped events collection');
    } catch (error) {
      console.log('Events collection does not exist or already dropped');
    }
    
    // Create fresh collections with proper indexes
    console.log('Creating fresh collections...');
    
    // Create users collection
    await db.createCollection('users');
    console.log('✓ Created users collection');
    
    // Create events collection
    await db.createCollection('events');
    console.log('✓ Created events collection');
    
    // Create proper indexes
    console.log('Creating indexes...');
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✓ Created unique index on email field');
    
    // Events collection indexes
    await db.collection('events').createIndex({ title: 1 });
    await db.collection('events').createIndex({ date: 1 });
    await db.collection('events').createIndex({ category: 1 });
    await db.collection('events').createIndex({ createdBy: 1 });
    console.log('✓ Created indexes on events collection');
    
    console.log('\n✅ Database fixed successfully!');
    console.log('✅ Old indexes removed');
    console.log('✅ Fresh collections created');
    console.log('✅ Proper indexes applied');
    
    console.log('\nYou can now:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Create admin user: node scripts/createAdmin.js');
    console.log('3. Test the application');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check your MongoDB connection string');
    console.log('2. Ensure you have write permissions to the database');
    console.log('3. Try connecting to MongoDB Atlas dashboard to verify access');
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

fixDatabase(); 
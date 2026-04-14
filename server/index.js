const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;

async function seedData() {
  try {
    // Use native collection to bypass mongoose pre-save hooks
    const usersCol = mongoose.connection.collection('users');
    const guestObjId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
    const existingGuest = await usersCol.findOne({ _id: guestObjId });
    if (!existingGuest) {
      await usersCol.insertOne({
        _id: guestObjId,
        username: 'Eco Explorer',
        email: 'guest@greenquest.dev',
        role: 'student',
        points: 0,
        level: 1,
        xp: 0,
        coins: 50,
        streak: 0,
        league: 'Bronze',
        inventory: [],
        achievements: [],
        progress: [],
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=EcoExplorer',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Guest User Initialized');
    }

    const modulesCol = mongoose.connection.collection('modules');
    const moduleCount = await modulesCol.countDocuments();
    if (moduleCount === 0) {
      const m1Id = new mongoose.Types.ObjectId();
      const m2Id = new mongoose.Types.ObjectId();

      await modulesCol.insertMany([
        { _id: m1Id, title: 'Recycling 101', description: 'Learn how to sort waste.', order: 1 },
        { _id: m2Id, title: 'Climate Foundations', description: 'Understanding global warming.', order: 2 }
      ]);

      const lessonsCol = mongoose.connection.collection('lessons');
      await lessonsCol.insertMany([
        { moduleId: m1Id, title: 'What is Recycling?', type: 'text', content: 'Recycling converts waste materials into new materials and objects. It is an alternative to conventional waste disposal that can save material and help lower greenhouse gas emissions.', order: 1 },
        { moduleId: m1Id, title: 'Sorting Basics', type: 'image', content: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80', order: 2 },
        { moduleId: m2Id, title: 'The Greenhouse Effect', type: 'text', content: 'Greenhouse gases trap heat in the atmosphere, creating a warming effect globally known as climate change.', order: 1 }
      ]);

      const quizCol = mongoose.connection.collection('quizquestions');
      await quizCol.insertMany([
        { moduleId: m1Id, question: 'Which of the following goes into the blue bin?', type: 'MCQ', options: ['Banana Peel', 'Cardboard Box', 'Used Napkin'], answer: 'Cardboard Box', hint: 'Think about paper products.' },
        { moduleId: m1Id, question: 'Plastic bags are easily recycled in standard bins.', type: 'TF', options: ['True', 'False'], answer: 'False', hint: 'They often jam sorting machines.' },
        { moduleId: m2Id, question: 'What gas is the primary driver of climate change?', type: 'MCQ', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen'], answer: 'Carbon Dioxide', hint: 'CO2' }
      ]);
      console.log('Learning Data Seeded');
    }
  } catch (err) {
    console.error('Seeding Error:', err.message);
  }
}

async function connectToMongo() {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('Connected to In-Memory MongoDB (Bypassing network blocks)');
    await seedData();
    console.log('Server ready!');
  } catch (err) {
    console.log('Memory DB Error:', err);
  }
}
connectToMongo();

app.get('/', (req, res) => {
  res.send('GreenQuest API is running');
});

const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const socialRoutes = require('./routes/social');
const storeRoutes = require('./routes/store');
const learningRoutes = require('./routes/learning');
const aiRoutes = require('./routes/ai');

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/ai', aiRoutes);

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});

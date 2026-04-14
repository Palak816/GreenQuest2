const mongoose = require('mongoose');
const Module = require('./models/Module');
const Lesson = require('./models/Lesson');
const QuizQuestion = require('./models/QuizQuestion');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greenquest');
  
  await Module.deleteMany({});
  await Lesson.deleteMany({});
  await QuizQuestion.deleteMany({});

  const m1 = await Module.create({ title: 'Recycling 101', description: 'Learn how to sort waste.', order: 1 });
  const m2 = await Module.create({ title: 'Climate Foundations', description: 'Understanding global warming.', order: 2 });

  await Lesson.create([
    { moduleId: m1._id, title: 'What is Recycling?', type: 'text', content: 'Recycling converts waste materials into new materials and objects. It is an alternative to conventional waste disposal that can save material and help lower greenhouse gas emissions.', order: 1 },
    { moduleId: m1._id, title: 'Sorting Basics', type: 'image', content: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80', order: 2 }
  ]);

  await Lesson.create([
    { moduleId: m2._id, title: 'The Greenhouse Effect', type: 'text', content: 'Greenhouse gases trap heat in the atmosphere, creating a warming effect globally known as climate change.', order: 1 }
  ]);

  await QuizQuestion.create([
    { moduleId: m1._id, question: 'Which of the following goes into the blue bin?', type: 'MCQ', options: ['Banana Peel', 'Cardboard Box', 'Used Napkin'], answer: 'Cardboard Box', hint: 'Think about paper products.' },
    { moduleId: m1._id, question: 'Plastic bags are easily recycled in standard bins.', type: 'TF', options: ['True', 'False'], answer: 'False', hint: 'They often jam sorting machines.' },
    { moduleId: m1._id, question: 'E-waste stands for _________ waste.', type: 'FillBlank', options: [], answer: 'Electronic', hint: 'Starts with an E.' }
  ]);
  
  console.log('Seeded Learning Modules!');
  process.exit();
}
seed();

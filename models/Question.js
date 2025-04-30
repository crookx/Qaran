import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  helpful: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const questionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: String,
    default: null
  },
  question: {
    type: String,
    required: true
  },
  answers: [answerSchema],
  helpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

export default Question;
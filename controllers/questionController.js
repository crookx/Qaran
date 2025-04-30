import Question from '../models/Question.js';
import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler.js';

export const getProductQuestions = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID'
      });
    }

    const questions = await Question.find({ product: productId })
      .select('-__v')
      .sort('-createdAt');

    res.json({
      status: 'success',
      data: {
        questions
      }
    });
  } catch (error) {
    console.error('Error in getProductQuestions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch questions'
    });
  }
};

export const submitQuestion = async (req, res) => {
  try {
    const { productId } = req.params;
    const { question } = req.body;
    const userId = req.user?._id;

    const newQuestion = await Question.create({
      product: productId,
      user: userId,
      question,
      answers: []
    });

    res.status(201).json({
      status: 'success',
      data: {
        question: newQuestion
      }
    });
  } catch (error) {
    console.error('Error in submitQuestion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit question'
    });
  }
};

export const answerQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const question = await Question.findByIdAndUpdate(
      id,
      {
        answer,
        answeredBy: req.user._id,
        isAnswered: true
      },
      { new: true }
    ).populate('user answeredBy', 'name avatar');

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const markHelpful = async (req, res) => {
  try {
    const { questionId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid question ID format'
      });
    }

    const question = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: question
    });
  } catch (error) {
    console.error('Error in markHelpful:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to mark question as helpful'
    });
  }
};
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  acceptedAnswerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vote: {
      type: Number,
      enum: [1, -1],
      required: true
    }
  }]
}, {
  timestamps: true
});

questionSchema.virtual('voteCount').get(function() {
  return this.votes.reduce((sum, vote) => sum + vote.vote, 0);
});

questionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Question', questionSchema);

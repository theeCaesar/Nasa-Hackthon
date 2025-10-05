const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
    },
  },
  {
    timestamps: true,
  },
);

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact;
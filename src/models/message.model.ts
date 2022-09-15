import cookieParser from 'cookie-parser';
import mongoose from 'mongoose'
const messageSchema = new mongoose.Schema({
  surname: String,
  familyFunds: Number,
  date: {
    type: String,
    unique: true,
  },
  invitationCode: {
    type: String,
    unique: false,
  },
  members: [
    {
      type: Object,
      ref: 'Member',
      default: "[]"
    },
  ],
});
const Family = mongoose.model('Family', messageSchema);
export default Family;


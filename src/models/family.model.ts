import cookieParser from 'cookie-parser';
import mongoose from 'mongoose'
const familySchema = new mongoose.Schema({
  surname: String,
  familyFunds: Number,
  familyId: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    unique: false,
  },
  private: {
    type: Boolean,
    unique: false
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId, ref:"User",
      default: [],
    },
  ],
});
const Family = mongoose.model('Family', familySchema);
export default Family;


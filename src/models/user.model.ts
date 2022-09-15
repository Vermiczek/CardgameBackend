import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId, ref:"Family",
  },
  family: {type: String,
  default: ""},
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  status: {
    type: String,
    enum: ['Pending', 'Active'],
    default: 'Active',
  },
  confirmationCode: {
    type: String,
    unique: false,
  },
  roles: [
    {
      type: String,
      ref: 'Role',
    },
  ],
});
const User = mongoose.model('User', userSchema);
export default User;
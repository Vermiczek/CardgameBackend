import express from 'express';
import cookieParser from 'cookie-parser';
import auth from './middleware/auth.js'
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import userRouter from './routes/user.js'
import familyRouter from './routes/family.js'

dotenv.config();



export const app = express();

import http from 'http';
const server = http.createServer(app);
import { Server } from "socket.io";
import { Console } from 'console';
const io = new Server(server,  {
  cors: {
    origin: "http://localhost:3001",
  }});




var corsOptions = {
  credentials: true,
  origin: 'http://localhost:3001',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Database'));


io.on('connection', (socket) => {
  console.log("COCKS");
  socket.emit("hello", "world");
  socket.on('test', (socket)=>{
    console.log("NIGGERS");
   });
});



app.use(express.json());

app.use(cors(corsOptions));
app.use(cookieParser());
app.use('/user', cors(corsOptions), userRouter);
app.use('/family', auth, cors(corsOptions), familyRouter);
server.listen(3000, () => console.log('Server Started'));

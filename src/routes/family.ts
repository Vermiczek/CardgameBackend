import e, { Request } from 'express';
import bcrypt from 'bcrypt';
import express from 'express';
const router = express.Router();
import Family from '../models/family.model.js';
import {generateFamilyId, generateInvitationCode} from '../services/family.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
interface IGetUserAuthInfoRequest extends Request {
  user: {
    email: string;
  };
}


router.post('/create', async (req: IGetUserAuthInfoRequest, res) => {
  let invitationCodeGen = generateInvitationCode();
  let idCodeGen = '';

  while (1) {
    idCodeGen = generateFamilyId();
    const familyRepetition = await Family.findOne({ familyId: idCodeGen });
    if (familyRepetition === null) break;
  }
  // const family = new Family({ surname: req.body.surname, familyId: idCodeGen, invitationCode: hashedPassword, familyFunds: 1000 });
  // if (family === null) {
  //   res.status(400).json({ message: 'family not found' });
  // }
  try {
    const user = await User.findOne({ email: req.user.email });
    if (user === null) {
      return res.status(403).json({ message: "user doesn't exist" });
    } else if (user.family !== "") {
      return res.status(403).json({ message: 'user already in family' });
    }

    try {
      const family = new Family({ familyId: req.body.familyId, password: req.body.password, private: true });
      family.members.push(user);
      const newFamily = await family.save();
      user.family = idCodeGen;
      await user.save();
      return res.status(201).json({ user: newFamily, success: true });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/join', async (req: IGetUserAuthInfoRequest, res) => {
  const family = await Family.findOne({ familyId: req.body.familyId });
  const user = await User.findOne({ email: req.user.email });
  if (family === null) {
    return res.status(400).send({ message: 'Cannot find family' });
  }
  if (user === null) {
    return res.status(400).send({ message: 'Cannot find user' });
  }
  
  try {
    if (req.body.password=== family.password) {
      try {
        for (let i = 0; i < family.members.length; i++) {
          if (family.members[i].email===req.user.email) {
            return res.status(400).send({ message: 'User already inf family!' });
          }
        }
        user.family = family.familyId;
        user.room = family;
        await user.save();
        family.members.push({ name: user.name, surname: user.surname, email: user.email });
        await family.save();
        return res.status(200).send({ message: 'User joined!' });
      } catch (err) {
        return res.status(400).send({ message: err });
      }
    } else {
      return res.status(403).send({ message: 'Wrong invitation code!' });
    }
  } catch (err) {
    return res.status(400).send({ message: 'Wrong password data!' });
  }
});

router.post('/leave', async (req: IGetUserAuthInfoRequest, res) => {
  const user = await User.findOne({ email: req.user.email });
  const family = await Family.findOne({ familyId: user.family });
  try {
    if (family === null) {
      return res.status(400).send({ message: 'Cannot find family' });
    }
    if (user === null) {
      return res.status(400).send({ message: 'Cannot find user' });
    }
    if (user.family === ""
      ) {
      return res.status(400).send({ message: "User isn't in a family" });
    }
    for (let i = 0; i < family.members.length; i++) {
      if (family.members[i].email) {
        user.family = "";
        await user.save();
        family.members.splice(i, 1);
        await family.save();
        return res.status(200).send({ message: 'User left the family' });
      }
      return res.status(400).send({ message: 'User not in family' });
    }
  } catch (e) {
    console.log(e);
  }
  family.familyFunds += req.body.expenses;
  await family.save();
});

router.post('/addExpenses', async (req: IGetUserAuthInfoRequest, res) => {
  if (isNaN(req.body.expenses)) return res.status(400).json({ message: 'Wrong fund format!' });
  if (req.body.expenses < 0) return res.status(400).json({ message: "Can't add funds as regular user!" });

  const user = await User.findOne({ email: req.user.email });
  const family = await Family.findOne({ familyId: user.family });

  try {
    if (family === null) {
      return res.status(400).send({ message: 'Cannot find family' });
    }
    if (user === null) {
      return res.status(400).send({ message: 'Cannot find user' });
    }
  } catch (e) {
    console.log(e);
  }
  family.familyFunds -= req.body.expenses;
  await family.save();
});

router.post('/addFunds', async (req: IGetUserAuthInfoRequest, res) => {
  if (isNaN(req.body.funds)) return res.status(400).json({ message: 'Wrong fund format!' });
  const user = await User.findOne({ email: req.user.email });
  const family = await Family.findOne({ familyId: req.body.id });

  if (user.roles[0] !== 'admin') {
    return res.status(400).send({ message: 'Insufficient permissions' });
  }
  try {
    if (family === null) {
      return res.status(400).send({ message: 'Cannot find family' });
    }
    if (user === null) {
      return res.status(400).send({ message: 'Cannot find user' });
    }
    family.familyFunds += req.body.funds;
    await family.save();
    return res.status(400).send({ message: 'Added ' + req.body.funds });
  } catch (e) {
    console.log(e);
  }
  family.familyFunds += req.body.funds;
  await family.save();
});

router.post('/data', async (req: IGetUserAuthInfoRequest, res) => {
  const user = await User.findOne({ email: req.user.email });
  const family = await Family.find({ familyId: user.family });


  try {
    return res.status(200).json(family);
  } catch (err) {
    console.log(err);
  }
});

router.post('/allData', async (req: IGetUserAuthInfoRequest, res) => {
  const user = await User.findOne({ email: req.body.email });

  const family = await Family.findById(user.room);

  // if (user.roles[0] !== 'admin') {
  //   return res.status(403).send({ message: 'Insufficient permissions' });
  // }
  try {
    return res.status(200).json(family[0]);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: 'errored' })
  }
});

export default router;
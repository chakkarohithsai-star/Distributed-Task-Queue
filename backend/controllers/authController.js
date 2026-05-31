import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  res.json(user);
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid Password" });
  }

  // generating jwt token after login success
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  res.json({
    token,
    role: user.role,
    name: user.name,
    email: user.email,
    id: user._id,
  });
};

// Google Single Sign-On / OAuth controller handler
export const googleSSO = async (req, res) => {
  try {
    const { email, name, role } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: "Invalid Google payload parameters" });
    }

    // Find if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create user record with random password
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "client", // Default role
      });
      console.log(`[Google SSO] New user registered: ${name} (${email}) as ${user.role}`);
    } else {
      console.log(`[Google SSO] User authenticated: ${name} (${email})`);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      id: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all registered worker nodes
export const getWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: "worker" }).select("-password");
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
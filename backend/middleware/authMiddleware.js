// importing jwt package
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {

  // getting authorization header
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader);

  // checking if token exists
  if (!authHeader) {
    return res.status(401).json({
      message: "No Token",
    });
  }

  // splitting Bearer TOKEN
  const token = authHeader.split(" ")[1];

  console.log("TOKEN:", token);

  try {

    // verifying token using secret
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED:", decoded);

    // saving decoded user info
    req.user = decoded;

    // continue request
    next();

  } catch (error) {

    console.log(error);

    return res.status(401).json({
      message: "Invalid Token",
    });
  }
};
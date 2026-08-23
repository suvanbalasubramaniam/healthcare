import {
  registerPatient,
  loginUser,
  getUserById
} from "../services/authService.js";

import {
  registerSchema,
  loginSchema
} from "../validators/authValidator.js";

export const register = async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const result = await registerPatient(validatedData);

    res.status(201).json({
      success: true,
      message: "Patient account created successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await loginUser(validatedData);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};
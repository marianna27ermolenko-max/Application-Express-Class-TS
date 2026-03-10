import { body } from "express-validator";

export const loginBodyValidation = body("login")
  .exists()
  .withMessage("Login is required")
  .isString()
  .withMessage("Login must be a string")
  .isLength({ min: 3, max: 10 })
  .withMessage("Login must be longer than 3 and less than 10 characters long")
  .matches(/^[a-zA-Z0-9_-]*$/)
  .withMessage("Login must match the address template");

export const passwordBodyValidation = body("password")
  .exists()
  .withMessage("Password is required")
  .isString()
  .withMessage("Password must be a string")
  .isLength({ min: 6, max: 20 })
  .withMessage("Password cannot be longer than 20 characters")
  .trim()
  .notEmpty()
  .withMessage("Password can not be empty");

  export const  emailBodyValidation = body('email')
  .exists()
  .withMessage("Email is required")
  .default(null)
  .isString()
  .withMessage("Email must be a string")
  .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
  .withMessage("Email must match the address template");


  export const bodyUsersValidation = [
    loginBodyValidation, passwordBodyValidation, emailBodyValidation
  ]


import { body } from "express-validator";

export const loginOrEmailValidation = body("loginOrEmail")
  .isString()
  .trim()
  .isLength({ min: 3, max: 20 })
  .withMessage("loginOrEmail is not correct");

export const passwordValidation = body("password")
   .exists().withMessage('Password is required')
  .isString()
  .trim().notEmpty().withMessage('Password can not be empty')
  .isLength({ min: 6, max: 20 })
  .withMessage("Password is not correct");

export const newPasswordValidation = body("newPassword")
   .exists().withMessage('Password is required')
  .isString()
  .trim().notEmpty().withMessage('Password can not be empty')
  .isLength({ min: 6, max: 20 })
  .withMessage("Password is not correct");  

export const emailValidation = body("email")
  .exists().withMessage('Email is required')
  .isString()
  .trim().notEmpty().withMessage('Email can not be empty')
  .isLength({ min: 6, max: 50 })
  .withMessage("Email is not correct")
  .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/).withMessage('Email must match the address template')

export const loginValidation = body("login")
  .exists().withMessage('Login is required')
  .isString()
  .trim().notEmpty().withMessage('Login can not be empty')
  .isLength({ min: 3, max: 10 })
  .withMessage("Login is not correct")
  .matches(/^[a-zA-Z0-9_-]*$/).withMessage('Login must match the template');

export const codeValidation = body("code")
  .exists().withMessage('Code is required')
  .isString()
  .trim().notEmpty().withMessage('Code can not be empty')
  .isLength({ min: 1, max: 200})
  .withMessage("Code is not correct");

export const recoveryCodeValidation = body("recoveryCode")
  .exists().withMessage('Code is required')
  .isString()
  .trim().notEmpty().withMessage('Code can not be empty')
  .isLength({ min: 1, max: 200})
  .withMessage("Code is not correct");  


export const bodyAuthValidation = [ loginOrEmailValidation, passwordValidation ];

export const bodyAuthRegistration = [ loginValidation, emailValidation, passwordValidation ];

export const bodyAuthNewPassword = [ newPasswordValidation, recoveryCodeValidation ];

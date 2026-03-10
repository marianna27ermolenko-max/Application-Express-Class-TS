import { body } from "express-validator";

export const loginOrEmailValidation = body("loginOrEmail")
    .isString()
    .trim()
    .isLength({min: 1, max: 20})
    .withMessage("loginOrEmail is not correct");

    export const passwordValidation = body("password")
    .isString()
    .trim()
    .isLength({min: 6, max: 20})
    .withMessage("password is not correct");


export const bodyAuthValidation = [
    loginOrEmailValidation, passwordValidation
]
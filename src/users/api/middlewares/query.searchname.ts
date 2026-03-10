import { query } from "express-validator";

export const searchLoginTermValidation = query("searchLoginTerm")
  .default('')
  .trim()


export const searchEmailTermValidation = query("searchEmailTerm")
  .default('')
  .trim()

  export const searchTermValidation = [
    searchLoginTermValidation, searchEmailTermValidation
  ]

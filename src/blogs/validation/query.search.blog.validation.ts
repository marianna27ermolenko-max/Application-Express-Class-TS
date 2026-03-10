import { query } from "express-validator";

export const searchQueryValidation = query("searchNameTerm").default(null);

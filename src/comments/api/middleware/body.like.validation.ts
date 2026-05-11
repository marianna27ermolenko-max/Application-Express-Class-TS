  import { body } from "express-validator";
import { LikeStatus } from "../../domain/like.comment.entity"; 
  
  
  export const likeBodyValidation = body('likeStatus')
  .exists()
  .withMessage("Like status is required")
  .isIn(Object.values(LikeStatus))
  .withMessage("Invalid like status")

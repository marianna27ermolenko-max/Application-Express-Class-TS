import { FieldError } from "./FieldError";

export const APIErrorResult = 
(
    errors: FieldError[],
): { errorsMessages:  FieldError[] }  => {

  return { errorsMessages: errors };

};

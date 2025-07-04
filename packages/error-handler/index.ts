export class AppError extends Error{
   public readonly statusCode:number;
   public readonly isOperational:boolean;
   public readonly details?:any;
   
   constructor(message:string,statusCode:number,isOperational=true,details?:any){
      super(message);
      this.statusCode=statusCode;
      this.isOperational=isOperational;
      this.details=details;
      Error.captureStackTrace(this);
   }
}

// NOT Found error
export class NotFoundError extends AppError{
   constructor(message="Resource not found"){
      super(message,404);
   }
}

// validation error
export class ValidationError extends AppError{
   constructor(message="Invalid request data",details?:any){
      super(message,400,true,details);
   }
}

// Authentication error
export class AuthError extends AppError{
   constructor(message="UnAuthorizes"){
      super(message,403);
   }
}

// Forbidden Error
export class ForbiddenError extends AppError{
   constructor(message="Forbidden Access"){
      super(message,401);
   }
}

// Database error
export class DatabaseError extends AppError{
   constructor(message="Database Error",details?:any){
      super(message,401,true,details);
   }
}

// RateLimitError
export class RateLimitErrorDatabaseError extends AppError{
   constructor(message="Too many request, please try again later"){
      super(message,429);
   }
}

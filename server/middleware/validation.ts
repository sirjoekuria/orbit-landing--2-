import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from "../../shared/validation";

// Re-export for convenience or use directly
export { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };

// --- Middleware ---

export const validate = (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: error.errors.map(err => ({
                        path: err.path.join("."),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };

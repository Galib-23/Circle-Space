import { z } from "zod"


export const signupValidation = z.object({
    name: z.string().min(2, {message: 'Too Short'}),
    username: z.string().min(2, {message: 'Too Short for userName'}),
    email: z.string().email(),
    password: z.string().min(6, {message: 'Password must be greater than 6 characters'}),
    
  })
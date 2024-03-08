import { z } from "zod"


export const signupValidation = z.object({
    name: z.string().min(2, {message: 'Too Short'}),
    username: z.string().min(2, {message: 'Too Short for userName'}),
    email: z.string().email(),
    password: z.string().min(6, {message: 'Password must be greater than 6 characters'}),
    
})

export const signinValidation = z.object({
    email: z.string().email(),
    password: z.string().min(6, {message: 'Password must be greater than 6 characters'}),
    
})
export const PostValidation = z.object({
    caption: z.string().min(5).max(2200),
    file: z.custom<File[]>(),
    location: z.string().min(2).max(100),
    tags: z.string(),
})
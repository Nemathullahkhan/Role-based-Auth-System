import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {z} from "zod"
const prisma = new PrismaClient();

const signupSchema = z.object({
    email:z.string().email({message:"Invalid email"}),
    password: z.string().min(6,{message:"Password must be atleast 6 characters long"}),
})


export async function POST(req:Request) {
    try{
        const body = await req.json();
        const validation = signupSchema.safeParse(body);

        if(!validation.success) {
            return NextResponse.json({errors: validation.error.errors},{status:400});
        }

        const {email,password} = body;
        const existingUser = await prisma.user.findUnique({
            where:{email}
        })

        if(existingUser){
            return NextResponse.json({message:"User already exists"},{status:400});
        }

        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = await prisma.user.create({
            data:{
                email,
                password:hashedPassword
            }
        });

        return NextResponse.json({message:"User created successfully",user:newUser},{status:201});
    }catch(error){
        console.error("Error at signUp ",error);
        return NextResponse.json({message:"Server error"},{status: 500})
    }
    
}
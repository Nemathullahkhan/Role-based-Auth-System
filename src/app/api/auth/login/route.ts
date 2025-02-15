import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {z} from "zod"
const prisma = new PrismaClient();

const loginSchema = z.object({
    email:z.string().email({message:"Invalid email"}),
    password: z.string().min(6,{message:"Password must be atleast 6 characters long"})
})

export async function POST(req:Request){
    try {
        const body = await req.json();
        const validation = loginSchema.safeParse(body);

        if(!validation.success){
            return NextResponse.json({errors:validation.error.errors},{status:400});
        }

        const {email,password} = body;
        const user = await prisma.user.findUnique({
            where:{email}
        })
        if(!user){
            return NextResponse.json({message:"User not found "},{status:404})
        }

        const passwordMatch = await bcrypt.compare(password,user.password);
        if(!passwordMatch){
            return NextResponse.json({message:"Invalid credentials"},{status:401})
        }
        return NextResponse.json({message:"Login successfully"},{status:200})
    } catch (error) {
        console.error("Error at login ",error);
        return NextResponse.json({message:"Server error"},{status:500})
    }
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { toast } from "react-toastify";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters long" }),
});

export default function Login() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: unknown) => {
    setLoading(true);
    const res = await fetch("api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const result = await res.json();

    if (res.ok) {
      toast.success("Login successfully");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } else {
      toast.error(result.message || "Login Falied , Please try again");
    }
    setLoading(false);
  };
  return (
    <div className="max-w-sm  mx-auto mt-24 p-6 bg-zinc-300/40 rounded-lg shadow-md">
      <h1 className="text-3xl font-extralight tracking-tighter text-center text-black">
        Login
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your email"
                      className="border-2 border-zinc-300/90 focus:outline-2"
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          {/* Password Field */}
          <FormField control={form.control} name="password" 
          render = {({field})=>{
            return (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} 
                    placeholder = "******"
                    className="border-2 border-zinc-300/90 focus:outline-2"/>
                </FormControl>
              </FormItem>
            )
          }} />

          <span className="text-xs flex justify-center">New user? Try  
            <Link href = "/signup" className="font-bold underline ml-1.5 text-gray-900"> Signup </Link>
          </span>
          {/* Submit button */}
          <Button type = "submit" className="w-full mt-10" disabled={loading}>
            {loading? "Logging in ....":"Login"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

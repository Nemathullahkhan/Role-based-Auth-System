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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast of 6 characters long " }),
});
export default function SignUp() {
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "" },
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: unknown) => {
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = await res.json();

    if (res.ok) {
      toast.success("SignUp succesfully! Redirecting to Login....");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      toast.error(result.message || "SignUp failed, Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm  mx-auto mt-24 p-6 bg-zinc-300/40 rounded-lg shadow-md">
      <h1 className="text-3xl font-extralight tracking-tighter text-center text-black">
        SignUp
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Email field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" className="border-2 border-zinc-300/90 focus:outline-2" {...field} />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          {/* Password Field */}
          <FormField 
           control = {form.control}
           name = "password"
           render = {({field})=>{
            return (
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input placeholder="*******" className="border-2 border-zinc-300/90" {...field}/>
                    </FormControl>
                </FormItem>
            )
           }}
           />

           {/* Submit Button */}
           <Button type = "submit" className="w-full mt-10" disabled={loading}>
            {loading? "SigningUp....":"Signup"}
           </Button>
        </form>
      </Form>
    </div>
  );
}

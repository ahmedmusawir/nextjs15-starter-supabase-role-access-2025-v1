"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const formSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Email is required",
    })
    .email({
      message: "Please enter a valid email",
    }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null); // Reset error state before submission

    try {
      // Call the login API directly instead of using Zustand store
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        // Login successful - update Zustand store for client-side state
        await login(data.email, data.password);
        
        // Check if there's a stored URL in local storage
        const redirectURL = localStorage.getItem("redirectAfterLogin");

        if (redirectURL) {
          // Clear the stored URL after using it
          localStorage.removeItem("redirectAfterLogin");
          router.push(redirectURL);
        } else {
          // Use server-side user data for role-based redirection
          const userMetadata = result.data.user?.user_metadata || {};
          
          // Default role-based redirection using server data
          if (userMetadata.is_qr_superadmin) {
            router.push("/superadmin-portal");
          } else if (userMetadata.is_qr_admin) {
            router.push("/admin-portal");
          } else if (userMetadata.is_qr_member) {
            router.push("/members-portal");
          } else {
            router.push("/"); // Fallback in case no roles match
          }
        }
      } else {
        setError(result.error || "Authentication failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Login error:", error.message);
      setError(error.message); // Set the error state
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Log into your account with your credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text.white">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        className="p-6 bg-slate-100 dark:bg-slate-500 dark:text-white"
                        placeholder="Please Enter Email"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className="dark:text-red-300" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text.white">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="p-6 bg-slate-100 dark:bg-slate-500 dark:text-white"
                        placeholder="Please Enter password"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className="dark:text-red-300" />
                  </FormItem>
                )}
              />
              {error && (
                <div className="text-red-500 dark:text-red-300 text-sm mt-2">
                  {error}
                </div>
              )}
              <Button className="w-full bg-slate-700 text-white dark:bg-slate-600 dark:text-white hover:bg-gray-900">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default LoginForm;

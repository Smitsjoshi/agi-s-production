'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/use-session';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  accessCode: z.string().min(1, { message: 'Access code is required.' }),
});

export function SignInForm() {
  const { signIn, isLoading } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'mmsjsmit@gmail.com',
      accessCode: '123456',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.email === 'mmsjsmit@gmail.com' && values.accessCode === '123456') {
      toast({
        title: 'Authentication Successful',
        description: 'Welcome back!',
      });
      
      // Simulate sign-in and redirect
      setTimeout(() => {
        signIn();
        router.push('/ask');
      }, 1000);
    } else {
      toast({
        title: 'Authentication Failed',
        description: 'Invalid credentials. Please contact Smit for support.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accessCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Code</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Mail className="mr-2" />
              Sign In
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

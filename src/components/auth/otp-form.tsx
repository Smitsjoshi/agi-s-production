'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/use-session';

const formSchema = z.object({
  otp: z.string().min(6, { message: 'Your one-time password must be 6 characters.' }).max(6, { message: 'Your one-time password must be 6 characters.' }),
});

export function OtpForm() {
  const { signIn, isLoading } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const user = await signIn(values.otp);
      toast({
        title: 'Authentication Successful',
        description: `Welcome, ${user.name}!`,
      });
      router.push('/ask');
    } catch (error) {
      toast({
        title: 'Authentication Failed',
        description: 'Invalid access code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access Code</FormLabel>
              <FormControl>
                <Input placeholder="_ _ _ _ _ _" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            'Submit'
          )}
        </Button>
      </form>
    </Form>
  );
}

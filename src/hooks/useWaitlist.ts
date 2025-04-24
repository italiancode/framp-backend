// hooks/useWaitlist.ts

type WaitlistParams = {
  email: string;
  name: string;
  wallet: string;
  referral: string;
};

type WaitlistResponse = {
  success: boolean;
  error: string | null;
};

export const signUpWaitlist = async ({ email, name, wallet, referral }: WaitlistParams): Promise<WaitlistResponse> => {
  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, wallet, referral }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      // Extract specific error message from the API response
      throw new Error(data.error || 'Failed to sign up.');
    }
    
    return { success: true, error: null };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to join waitlist'
    };
  }
};

'use client'

// components/WaitlistForm.tsx
import { useState } from 'react';
import { signUpWaitlist } from '../hooks/useWaitlist';

const WaitlistForm = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [wallet, setWallet] = useState('');
  const [referral, setReferral] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await signUpWaitlist({
        email,
        name,
        wallet,
        referral,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Join the Framp Waitlist</h2>
      {success ? (
        <div className="text-center text-green-600">
          <p>✅ You're on the waitlist! Check your email to confirm.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="John Doe"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="youremail@example.com"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="wallet" className="block text-gray-700">Wallet Address (optional)</label>
            <input
              type="text"
              id="wallet"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Your wallet address"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="referral" className="block text-gray-700">Referral Code (optional)</label>
            <input
              type="text"
              id="referral"
              value={referral}
              onChange={(e) => setReferral(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Referral code"
            />
          </div>
          {error && <p className="text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Join Waitlist'}
          </button>
        </form>
      )}
    </div>
  );
};

export default WaitlistForm;

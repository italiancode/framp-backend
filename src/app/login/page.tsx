'use client'

import { BackgroundElements } from '@/components/ui/BackgroundElements';
import Layout from '@/components/layout/Layout';
import LoginForm from '../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <Layout>
      <section className="py-16 min-h-[90vh] relative bg-white dark:bg-background">
        <BackgroundElements />
        
        <div className="container relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto">
            <LoginForm />
          </div>
        </div>
      </section>
    </Layout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, ArrowRight, Sparkles } from 'lucide-react';

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: 'Starter',
      price: 49,
      period: 'month',
      description: 'Perfect for small cafes and boutiques',
      features: [
        'Up to 5 venues',
        'Up to 5 devices',
        '3 team members',
        'Basic music library',
        'Email support',
      ],
      highlighted: false,
    },
    {
      name: 'Professional',
      price: 149,
      period: 'month',
      description: 'Ideal for growing businesses',
      features: [
        'Up to 20 venues',
        'Up to 30 devices',
        '10 team members',
        'Full music library + S3 upload',
        'Advanced analytics',
        'Custom playlists',
        'Priority support',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 4999,
      period: 'year',
      description: 'For large organizations',
      features: [
        'Unlimited venues',
        'Unlimited devices',
        'Unlimited team members',
        'Full music library + S3 upload',
        'Advanced analytics',
        'API access',
        'White-label options',
        'Dedicated account manager',
        '24/7 phone support',
      ],
      highlighted: false,
    },
  ];

  const handleContactSales = () => {
    window.location.href = 'mailto:sales@soundmark.app?subject=Upgrade Inquiry';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Upgrade Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your subscription is inactive. Choose a plan to continue using Soundmark and unlock powerful features for your business.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.highlighted
                  ? 'border-violet-500/50 shadow-lg shadow-violet-500/20'
                  : 'border-border/60'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={handleContactSales}
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500'
                      : ''
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  Contact Sales
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Can I try before I buy?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! All new accounts start with a 14-day free trial. No credit card required.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Can I change plans later?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely. You can upgrade or downgrade your plan at any time from your account settings.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards, bank transfers, and invoicing for Enterprise customers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Need help choosing?</h3>
              <p className="text-sm text-muted-foreground">
                Contact our sales team at{' '}
                <a href="mailto:sales@soundmark.app" className="text-violet-400 hover:underline">
                  sales@soundmark.app
                </a>{' '}
                and we'll help you find the perfect plan for your business.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Demo */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => router.push('/demo')}>
            ← Back to Demo
          </Button>
        </div>
      </div>
    </div>
  );
}

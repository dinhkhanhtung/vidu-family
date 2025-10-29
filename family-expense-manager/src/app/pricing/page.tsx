'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'
import { PLANS } from '@/lib/subscriptions'

const PLAN_DETAILS = {
  FREE: {
    name: 'FREE',
    description: 'Perfect for individuals and small families',
    maxMembers: 6,
    price: 0,
    features: [
      { name: 'Unlimited Transactions', included: true },
      { name: 'Basic Features', included: true },
      { name: 'Budgeting', included: false },
      { name: 'Goals & Alerts', included: false },
      { name: 'Export Data', included: false },
      { name: 'Bank Connect', included: false },
      { name: 'Tax Reports', included: false },
      { name: 'API Access', included: false },
    ],
  },
  GROWTH: {
    name: 'GROWTH',
    description: 'Ideal for growing families and teams',
    maxMembers: 12,
    price: 9.99,
    features: [
      { name: 'Unlimited Transactions', included: true },
      { name: 'Basic Features', included: true },
      { name: 'Budgeting', included: true },
      { name: 'Goals & Alerts', included: true },
      { name: 'Export Data', included: true },
      { name: 'Bank Connect', included: false },
      { name: 'Tax Reports', included: false },
      { name: 'API Access', included: false },
    ],
  },
  BUSINESS: {
    name: 'BUSINESS',
    description: 'Advanced features for businesses and large teams',
    maxMembers: 25,
    price: 19.99,
    features: [
      { name: 'Unlimited Transactions', included: true },
      { name: 'Basic Features', included: true },
      { name: 'Budgeting', included: true },
      { name: 'Goals & Alerts', included: true },
      { name: 'Export Data', included: true },
      { name: 'Bank Connect', included: true },
      { name: 'Tax Reports', included: true },
      { name: 'API Access', included: true },
    ],
  },
}

export default function PricingPage() {
  const { data: session } = useSession()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectPlan = async (planName: string) => {
    if (!session) {
      // Redirect to sign in or show sign in modal
      window.location.href = '/auth/signin'
      return
    }

    setIsLoading(true)
    try {
      // For now, just show the selected plan
      // In a real implementation, this would redirect to Stripe Checkout
      setSelectedPlan(planName)
      console.log(`Selected plan: ${planName}`)

      // TODO: Implement Stripe Checkout integration
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ planName, priceId: PLAN_PRICE_IDS[planName] }),
      // })
      // const { url } = await response.json()
      // window.location.href = url
    } catch (error) {
      console.error('Error selecting plan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your family or team. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(PLAN_DETAILS).map(([key, plan]) => (
            <Card
              key={key}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                selectedPlan === key ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
            >
              {/* Popular Badge */}
              {key === 'GROWTH' && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Up to {plan.maxMembers} members
                </div>
              </CardHeader>

              <CardContent className="px-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-500'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="px-6 pb-6">
                <Button
                  onClick={() => handleSelectPlan(key)}
                  disabled={isLoading}
                  className={`w-full ${
                    key === 'GROWTH'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  size="lg"
                >
                  {isLoading ? 'Processing...' : `Choose ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens to my data if I downgrade?
              </h3>
              <p className="text-gray-600">
                Your data is safe. If you exceed the limits of your new plan, you'll be prompted to upgrade or remove some data.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes! All paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers for annual plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

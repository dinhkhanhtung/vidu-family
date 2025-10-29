'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface Subscription {
  id: string
  status: string
  plan: {
    name: string
    maxMembers: number
    features: any
  }
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
  invoices: Array<{
    id: string
    amount: number
    currency: string
    status: string
    createdAt: string
    invoicePdf?: string
  }>
}

export default function BillingPage() {
  const { data: session } = useSession()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      loadSubscription()
    }
  }, [session])

  const loadSubscription = async () => {
    try {
      // In a real implementation, you'd get the workspace ID from the user's session
      // For now, we'll use a placeholder
      const workspaceId = 'current-workspace-id' // TODO: Get from session/context

      const response = await fetch(`/api/subscriptions/workspace/${workspaceId}`)
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = () => {
    // TODO: Implement Stripe Customer Portal integration
    console.log('Redirect to Stripe Customer Portal')
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement invoice download
    console.log('Download invoice:', invoiceId)
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'past_due':
      case 'unpaid':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'canceled':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'past_due':
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Subscription Found</h1>
          <p className="text-gray-600 mb-8">
            You don't have an active subscription. Choose a plan to get started.
          </p>
          <Button onClick={() => window.location.href = '/pricing'}>
            View Plans
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription, payment method, and billing history.
          </p>
        </div>

        {/* Current Subscription */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  {getStatusIcon(subscription.status)}
                  Current Subscription
                </CardTitle>
                <CardDescription className="mt-2">
                  {subscription.plan.name} Plan - Up to {subscription.plan.maxMembers} members
                </CardDescription>
              </div>
              <Badge className={getStatusColor(subscription.status)}>
                {subscription.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Billing Period</h4>
                <p className="text-gray-600">
                  {subscription.currentPeriodStart
                    ? new Date(subscription.currentPeriodStart).toLocaleDateString()
                    : 'N/A'
                  } - {subscription.currentPeriodEnd
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Next Billing Date</h4>
                <p className="text-gray-600">
                  {subscription.currentPeriodEnd
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                <p className="text-gray-600">
                  {subscription.cancelAtPeriodEnd
                    ? 'Cancels at period end'
                    : 'Active subscription'
                  }
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex gap-4">
              <Button onClick={handleManageBilling}>
                Manage Billing
              </Button>
              {!subscription.cancelAtPeriodEnd && subscription.status === 'active' && (
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              Download invoices and view payment history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription.invoices.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No invoices found.
              </p>
            ) : (
              <div className="space-y-4">
                {subscription.invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          ${invoice.amount} {invoice.currency.toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    {invoice.invoicePdf && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

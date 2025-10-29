import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, TrendingDown, Users, Download, Calendar } from "lucide-react"
import { RevenueByPlanChart } from "@/components/admin/RevenueByPlanChart"
import { ChurnAnalysisChart } from "@/components/admin/ChurnAnalysisChart"
import { PaymentFailuresTable } from "@/components/admin/PaymentFailuresTable"

export default function FinancialReports() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
          <p className="text-muted-foreground">
            Revenue analysis, churn tracking, and payment monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$542,772</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Failures</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+12</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Reports Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue by Plan</TabsTrigger>
          <TabsTrigger value="churn">Churn Analysis</TabsTrigger>
          <TabsTrigger value="failures">Payment Failures</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Revenue by Subscription Plan</CardTitle>
                <CardDescription>
                  Monthly revenue breakdown by subscription tiers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading revenue data...</div>}>
                  <RevenueByPlanChart />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Premium Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$28,450</div>
                <p className="text-xs text-muted-foreground">
                  63% of total revenue
                </p>
                <Badge className="mt-2 bg-purple-100 text-purple-800">142 users</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,340</div>
                <p className="text-xs text-muted-foreground">
                  27% of total revenue
                </p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">185 users</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Free Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0</div>
                <p className="text-xs text-muted-foreground">
                  0% of total revenue
                </p>
                <Badge className="mt-2 bg-gray-100 text-gray-800">2,520 users</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="churn">
          <Card>
            <CardHeader>
              <CardTitle>Churn Analysis</CardTitle>
              <CardDescription>
                Customer churn trends and analysis over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading churn analysis...</div>}>
                <ChurnAnalysisChart />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failures">
          <Card>
            <CardHeader>
              <CardTitle>Payment Failures</CardTitle>
              <CardDescription>
                Monitor and manage failed payment attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading payment failures...</div>}>
                <PaymentFailuresTable />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

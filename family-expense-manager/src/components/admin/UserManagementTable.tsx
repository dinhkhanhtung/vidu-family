"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Ban, CheckCircle, Crown, Shield } from "lucide-react"
import { format } from "date-fns"

const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "USER",
    adminRole: "MODERATOR",
    status: "ACTIVE",
    lastLogin: new Date("2024-01-15"),
    createdAt: new Date("2023-06-15"),
    subscription: "Premium",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "USER",
    adminRole: "USER",
    status: "ACTIVE",
    lastLogin: new Date("2024-01-14"),
    createdAt: new Date("2023-08-20"),
    subscription: "Basic",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "USER",
    adminRole: "ADMIN",
    status: "SUSPENDED",
    lastLogin: new Date("2024-01-10"),
    createdAt: new Date("2023-05-10"),
    subscription: "Premium",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    role: "USER",
    adminRole: "USER",
    status: "ACTIVE",
    lastLogin: new Date("2024-01-15"),
    createdAt: new Date("2023-09-05"),
    subscription: "Free",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@example.com",
    role: "USER",
    adminRole: "USER",
    status: "INACTIVE",
    lastLogin: new Date("2023-12-20"),
    createdAt: new Date("2023-04-15"),
    subscription: "Basic",
  },
]

export function UserManagementTable() {
  const [users, setUsers] = useState(mockUsers)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "SUSPENDED":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      case "INACTIVE":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAdminRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <Badge className="bg-purple-100 text-purple-800">Super Admin</Badge>
      case "ADMIN":
        return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>
      case "MODERATOR":
        return <Badge className="bg-yellow-100 text-yellow-800">Moderator</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case "Premium":
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
      case "Basic":
        return <Badge className="bg-blue-100 text-blue-800">Basic</Badge>
      case "Free":
        return <Badge variant="outline">Free</Badge>
      default:
        return <Badge variant="outline">{subscription}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Admin Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{user.role}</Badge>
              </TableCell>
              <TableCell>
                {getAdminRoleBadge(user.adminRole)}
              </TableCell>
              <TableCell>
                {getStatusBadge(user.status)}
              </TableCell>
              <TableCell>
                {getSubscriptionBadge(user.subscription)}
              </TableCell>
              <TableCell>
                {format(user.lastLogin, "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                {format(user.createdAt, "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Crown className="mr-2 h-4 w-4" />
                      Change Role
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4" />
                      Manage Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Ban className="mr-2 h-4 w-4" />
                      Suspend User
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

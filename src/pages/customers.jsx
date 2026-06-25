'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { isAuthenticated } from '@/utils/auth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Input } from '@/components/ui';
import { Search, Mail, Phone, MapPin } from 'lucide-react';
import { mockCustomerData } from '@/data/mockData';

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = mockCustomerData.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage and analyze your customer base</p>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-600 font-medium">Total Customers</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">2,840</h3>
              <p className="text-sm text-green-600 mt-2">+15.3% growth</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-gray-600 font-medium">Active Users</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">2,125</h3>
              <p className="text-sm text-green-600 mt-2">74.8% active rate</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-sm text-gray-600 font-medium">At Risk</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">142</h3>
              <p className="text-sm text-red-600 mt-2">5.0% churn risk</p>
            </div>
          </div>

          <Input
            placeholder="Search customers by name or email..."
            icon={<Search className="w-5 h-5" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer Directory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-all cursor-pointer bg-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                      {customer.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{customer.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      customer.status === 'active'
                        ? 'success'
                        : customer.status === 'at-risk'
                          ? 'warning'
                          : 'default'
                    }
                    size="sm"
                  >
                    {customer.status}
                  </Badge>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-semibold text-gray-900">${customer.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Orders</span>
                    <span className="font-semibold text-gray-900">{customer.orders}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Joined</span>
                    <span className="font-semibold text-gray-900">{customer.joinDate}</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps({ req }) {
  if (!isAuthenticated(req)) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
}

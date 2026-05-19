'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui';
import { Search, Download, Filter } from 'lucide-react';

export default function SalesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
            <p className="text-gray-600 mt-1">Track your sales performance and trends</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="md">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="primary" size="md">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Sales', value: '$1.24M', change: '+12.5%' },
              { label: 'Orders', value: '8,450', change: '+8.2%' },
              { label: 'Avg Order', value: '$148', change: '+5.1%' },
              { label: 'Conversion', value: '3.24%', change: '-0.5%' }
            ].map((stat, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                <p className={`text-sm mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Sales</h2>
            <Input
              placeholder="Search by order ID, customer, or product..."
              icon={<Search className="w-5 h-5" />}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by Region</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'].map((region) => (
              <div key={region} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-600 font-medium">{region}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">$450K</h3>
                <p className="text-sm text-green-600 mt-2">+18.2% vs last month</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

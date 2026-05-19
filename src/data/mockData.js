// Mock data for analytics dashboard

const generateChartData = (days = 30) => {
  const data = [];
  const today = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    data.push({
      date: dateStr,
      name: dateStr,
      value: Math.floor(Math.random() * 50000) + 10000,
      value2: Math.floor(Math.random() * 40000) + 5000,
      value3: Math.floor(Math.random() * 30000) + 3000,
      percentage: Math.floor(Math.random() * 100) + 10,
      category: ["Electronics", "Apparel", "Home", "Sports", "Books"][
        Math.floor(Math.random() * 5)
      ],
    });
  }

  return data;
};

export const mockKPIData = [
  {
    label: "Total Revenue",
    value: 1250000,
    change: 12.5,
    trend: "up",
    currency: "USD",
    format: "currency",
  },
  {
    label: "Total Orders",
    value: 8450,
    change: 8.2,
    trend: "up",
    format: "number",
  },
  {
    label: "Conversion Rate",
    value: 3.24,
    change: -0.5,
    trend: "down",
    format: "percent",
  },
  {
    label: "Avg. Order Value",
    value: 148,
    change: 5.1,
    trend: "up",
    currency: "USD",
    format: "currency",
  },
  {
    label: "Customer Growth",
    value: 2840,
    change: 15.3,
    trend: "up",
    format: "number",
  },
  {
    label: "Cart Abandonment",
    value: 42.5,
    change: -3.2,
    trend: "down",
    format: "percent",
  },
];

export const mockRevenueData = generateChartData(30);

export const mockSalesChartData = [
  {
    date: "2024-01-01",
    name: "Mon",
    value: 35000,
    value2: 28000,
    category: "sales",
  },
  {
    date: "2024-01-02",
    name: "Tue",
    value: 42000,
    value2: 31000,
    category: "sales",
  },
  {
    date: "2024-01-03",
    name: "Wed",
    value: 38000,
    value2: 29000,
    category: "sales",
  },
  {
    date: "2024-01-04",
    name: "Thu",
    value: 45000,
    value2: 35000,
    category: "sales",
  },
  {
    date: "2024-01-05",
    name: "Fri",
    value: 52000,
    value2: 41000,
    category: "sales",
  },
  {
    date: "2024-01-06",
    name: "Sat",
    value: 48000,
    value2: 38000,
    category: "sales",
  },
  {
    date: "2024-01-07",
    name: "Sun",
    value: 28000,
    value2: 22000,
    category: "sales",
  },
];

export const mockCustomerData = [
  {
    id: "1",
    name: "Sarah Anderson",
    email: "sarah.anderson@example.com",
    totalSpent: 24500,
    orders: 18,
    status: "active",
    joinDate: "2023-03-15",
    avatar: "🧑",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    totalSpent: 18200,
    orders: 12,
    status: "active",
    joinDate: "2023-05-22",
    avatar: "👨",
  },
  {
    id: "3",
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    totalSpent: 31800,
    orders: 24,
    status: "active",
    joinDate: "2022-11-08",
    avatar: "👩",
  },
  {
    id: "4",
    name: "James Roberts",
    email: "james.roberts@example.com",
    totalSpent: 5200,
    orders: 2,
    status: "at-risk",
    joinDate: "2024-01-10",
    avatar: "🧔",
  },
  {
    id: "5",
    name: "Lisa Thompson",
    email: "lisa.thompson@example.com",
    totalSpent: 42100,
    orders: 31,
    status: "active",
    joinDate: "2022-08-30",
    avatar: "👱‍♀️",
  },
  {
    id: "6",
    name: "David Martinez",
    email: "david.martinez@example.com",
    totalSpent: 0,
    orders: 0,
    status: "inactive",
    joinDate: "2023-12-15",
    avatar: "🧑‍🦱",
  },
  {
    id: "7",
    name: "Jennifer Lee",
    email: "jennifer.lee@example.com",
    totalSpent: 15600,
    orders: 9,
    status: "active",
    joinDate: "2023-09-20",
    avatar: "👩‍🦰",
  },
  {
    id: "8",
    name: "Robert Taylor",
    email: "robert.taylor@example.com",
    totalSpent: 28900,
    orders: 22,
    status: "active",
    joinDate: "2023-02-14",
    avatar: "🧑‍🦳",
  },
];

export const mockProductData = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    category: "Electronics",
    revenue: 245000,
    units: 1230,
    growth: 18.5,
    margin: 42,
    status: "high",
  },
  {
    id: "2",
    name: "Smart Watch Pro",
    category: "Electronics",
    revenue: 189000,
    units: 560,
    growth: 12.3,
    margin: 38,
    status: "high",
  },
  {
    id: "3",
    name: "Eco-Friendly Water Bottle",
    category: "Accessories",
    revenue: 127000,
    units: 6350,
    growth: 25.8,
    margin: 58,
    status: "high",
  },
  {
    id: "4",
    name: "Wireless Charger Pad",
    category: "Electronics",
    revenue: 98000,
    units: 4900,
    growth: -2.5,
    margin: 52,
    status: "medium",
  },
  {
    id: "5",
    name: "Athletic Performance Shoes",
    category: "Footwear",
    revenue: 156000,
    units: 780,
    growth: 8.2,
    margin: 44,
    status: "high",
  },
  {
    id: "6",
    name: "USB-C Cable 3-Pack",
    category: "Accessories",
    revenue: 45000,
    units: 9000,
    growth: -8.5,
    margin: 35,
    status: "low",
  },
  {
    id: "7",
    name: "Gaming Mouse Pro",
    category: "Electronics",
    revenue: 87000,
    units: 435,
    growth: 5.2,
    margin: 48,
    status: "medium",
  },
  {
    id: "8",
    name: "Portable Phone Stand",
    category: "Accessories",
    revenue: 32000,
    units: 3200,
    growth: 3.1,
    margin: 65,
    status: "low",
  },
];

export const mockRegionData = [
  {
    id: "us",
    name: "United States",
    revenue: 425000,
    sales: 2840,
    customers: 1250,
    growth: 14.2,
  },
  {
    id: "eu",
    name: "Europe",
    revenue: 320000,
    sales: 1920,
    customers: 890,
    growth: 9.8,
  },
  {
    id: "apac",
    name: "Asia Pacific",
    revenue: 285000,
    sales: 1680,
    customers: 760,
    growth: 21.5,
  },
  {
    id: "latam",
    name: "Latin America",
    revenue: 145000,
    sales: 890,
    customers: 380,
    growth: 18.3,
  },
  {
    id: "mea",
    name: "Middle East & Africa",
    revenue: 75000,
    sales: 420,
    customers: 180,
    growth: 12.1,
  },
];

export const mockSalesData = [
  {
    id: "ORD001",
    date: "2024-01-15",
    customer: "Sarah Anderson",
    product: "Premium Wireless Headphones",
    amount: 299.99,
    quantity: 1,
    region: "United States",
    status: "completed",
  },
  {
    id: "ORD002",
    date: "2024-01-14",
    customer: "Michael Chen",
    product: "Smart Watch Pro",
    amount: 449.99,
    quantity: 1,
    region: "Asia Pacific",
    status: "completed",
  },
  {
    id: "ORD003",
    date: "2024-01-14",
    customer: "Emma Wilson",
    product: "Eco-Friendly Water Bottle",
    amount: 29.99,
    quantity: 3,
    region: "Europe",
    status: "completed",
  },
  {
    id: "ORD004",
    date: "2024-01-13",
    customer: "James Roberts",
    product: "Wireless Charger Pad",
    amount: 79.99,
    quantity: 1,
    region: "United States",
    status: "pending",
  },
  {
    id: "ORD005",
    date: "2024-01-13",
    customer: "Lisa Thompson",
    product: "Gaming Mouse Pro",
    amount: 159.99,
    quantity: 2,
    region: "Europe",
    status: "completed",
  },
  {
    id: "ORD006",
    date: "2024-01-12",
    customer: "David Martinez",
    product: "Athletic Performance Shoes",
    amount: 189.99,
    quantity: 1,
    region: "Latin America",
    status: "failed",
  },
  {
    id: "ORD007",
    date: "2024-01-12",
    customer: "Jennifer Lee",
    product: "Premium Wireless Headphones",
    amount: 299.99,
    quantity: 1,
    region: "Asia Pacific",
    status: "completed",
  },
  {
    id: "ORD008",
    date: "2024-01-11",
    customer: "Robert Taylor",
    product: "Eco-Friendly Water Bottle",
    amount: 29.99,
    quantity: 5,
    region: "Middle East & Africa",
    status: "completed",
  },
];

export const mockForecastData = [
  {
    date: "2024-01",
    actual: 425000,
    predicted: 420000,
    lower: 380000,
    upper: 460000,
  },
  {
    date: "2024-02",
    actual: 475000,
    predicted: 470000,
    lower: 420000,
    upper: 520000,
  },
  {
    date: "2024-03",
    actual: 520000,
    predicted: 515000,
    lower: 460000,
    upper: 570000,
  },
  {
    date: "2024-04",
    actual: 0,
    predicted: 565000,
    lower: 500000,
    upper: 630000,
  },
  {
    date: "2024-05",
    actual: 0,
    predicted: 610000,
    lower: 540000,
    upper: 680000,
  },
  {
    date: "2024-06",
    actual: 0,
    predicted: 655000,
    lower: 580000,
    upper: 730000,
  },
];

export const mockCategoryDistribution = [
  { date: "", name: "Electronics", value: 450000, category: "Electronics" },
  { date: "", name: "Accessories", value: 280000, category: "Accessories" },
  { date: "", name: "Footwear", value: 210000, category: "Footwear" },
  { date: "", name: "Apparel", value: 310000, category: "Apparel" },
];

export const mockConversionFunnel = [
  { date: "", name: "Visitors", value: 125000, category: "funnel" },
  { date: "", name: "Product Views", value: 85000, category: "funnel" },
  { date: "", name: "Add to Cart", value: 32000, category: "funnel" },
  { date: "", name: "Checkout", value: 18000, category: "funnel" },
  { date: "", name: "Completed", value: 8450, category: "funnel" },
];

export const mockTopProducts = mockProductData
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 5);

export const mockTopCustomers = mockCustomerData
  .sort((a, b) => b.totalSpent - a.totalSpent)
  .slice(0, 5);

export const mockNotifications = [
  {
    id: "1",
    type: "success",
    title: "New Order",
    message: "Order ORD001 has been completed successfully",
    timestamp: new Date(Date.now() - 5 * 60000),
    read: false,
  },
  {
    id: "2",
    type: "warning",
    title: "Low Stock Alert",
    message: "Premium Wireless Headphones stock is below 100 units",
    timestamp: new Date(Date.now() - 15 * 60000),
    read: false,
  },
  {
    id: "3",
    type: "info",
    title: "Analytics Updated",
    message: "Your daily analytics report is ready",
    timestamp: new Date(Date.now() - 30 * 60000),
    read: true,
  },
];

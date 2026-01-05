import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  PieChart as PieChartIcon,
  BarChart3,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Zap,
  Home,
  Plane,
  Heart,
  MoreHorizontal
} from 'lucide-react';

interface CategoryData {
  name: string;
  value: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MonthlyData {
  month: string;
  food: number;
  transport: number;
  shopping: number;
  entertainment: number;
  utilities: number;
  other: number;
}

interface SpendingAnalyticsProps {
  categoryData?: Record<string, number>;
  monthlyData?: MonthlyData[];
  totalSpent?: number;
}

const categoryConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  food: { label: 'Food & Drinks', color: 'hsl(24, 95%, 53%)', icon: Utensils },
  transport: { label: 'Transport', color: 'hsl(217, 91%, 60%)', icon: Car },
  shopping: { label: 'Shopping', color: 'hsl(339, 90%, 51%)', icon: ShoppingBag },
  entertainment: { label: 'Entertainment', color: 'hsl(271, 81%, 56%)', icon: Film },
  utilities: { label: 'Utilities', color: 'hsl(45, 93%, 47%)', icon: Zap },
  rent: { label: 'Rent', color: 'hsl(142, 71%, 45%)', icon: Home },
  travel: { label: 'Travel', color: 'hsl(187, 85%, 43%)', icon: Plane },
  health: { label: 'Health', color: 'hsl(0, 84%, 60%)', icon: Heart },
  other: { label: 'Other', color: 'hsl(215, 14%, 34%)', icon: MoreHorizontal },
};

const defaultCategoryData: Record<string, number> = {
  food: 3500,
  transport: 1800,
  shopping: 2500,
  entertainment: 1200,
  utilities: 800,
  other: 600,
};

const defaultMonthlyData: MonthlyData[] = [
  { month: 'Jan', food: 3200, transport: 1500, shopping: 2000, entertainment: 800, utilities: 700, other: 400 },
  { month: 'Feb', food: 2800, transport: 1800, shopping: 1500, entertainment: 1200, utilities: 750, other: 350 },
  { month: 'Mar', food: 3500, transport: 1600, shopping: 2500, entertainment: 900, utilities: 800, other: 600 },
  { month: 'Apr', food: 3000, transport: 2000, shopping: 1800, entertainment: 1100, utilities: 820, other: 500 },
  { month: 'May', food: 3300, transport: 1700, shopping: 2200, entertainment: 1000, utilities: 780, other: 450 },
  { month: 'Jun', food: 3100, transport: 1900, shopping: 2100, entertainment: 1300, utilities: 850, other: 550 },
];

export function SpendingAnalytics({ 
  categoryData = defaultCategoryData, 
  monthlyData = defaultMonthlyData,
  totalSpent 
}: SpendingAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('pie');

  const pieData: CategoryData[] = Object.entries(categoryData).map(([key, value]) => ({
    name: categoryConfig[key]?.label || key,
    value,
    color: categoryConfig[key]?.color || 'hsl(215, 14%, 34%)',
    icon: categoryConfig[key]?.icon || MoreHorizontal,
  }));

  const total = totalSpent || pieData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name || payload[0].name}</p>
          <p className="text-primary font-semibold">
            ₹{(data.value || payload[0].value).toLocaleString('en-IN')}
          </p>
          {data.value && (
            <p className="text-xs text-muted-foreground">
              {((data.value / total) * 100).toFixed(1)}% of total
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6"
    >
      <Card className="shadow-soft border-border/50">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Spending Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
              <TabsTrigger value="pie" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <PieChartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Category</span> Breakdown
              </TabsTrigger>
              <TabsTrigger value="bar" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Monthly</span> Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pie" className="mt-0">
              <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
                <div className="w-full lg:w-1/2 h-[200px] sm:h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="w-full lg:w-1/2 grid grid-cols-2 gap-2 sm:gap-3">
                  {pieData.map((item, index) => {
                    const Icon = item.icon;
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-secondary/50"
                      >
                        <div
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.name}</p>
                          <p className="font-semibold text-foreground text-xs sm:text-sm">
                            ₹{item.value.toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">{percentage}%</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Total Spending</span>
                  <span className="text-lg sm:text-2xl font-bold text-foreground">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bar" className="mt-0">
              <div className="h-[250px] sm:h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} barCategoryGap="15%">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '10px' }}
                      iconSize={8}
                    />
                    <Bar dataKey="food" stackId="a" fill={categoryConfig.food.color} name="Food" />
                    <Bar dataKey="transport" stackId="a" fill={categoryConfig.transport.color} name="Transport" />
                    <Bar dataKey="shopping" stackId="a" fill={categoryConfig.shopping.color} name="Shopping" />
                    <Bar dataKey="entertainment" stackId="a" fill={categoryConfig.entertainment.color} name="Entertainment" />
                    <Bar dataKey="utilities" stackId="a" fill={categoryConfig.utilities.color} name="Utilities" />
                    <Bar dataKey="other" stackId="a" fill={categoryConfig.other.color} name="Other" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}

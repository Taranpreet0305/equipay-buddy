import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Lightbulb, TrendingUp, RefreshCw, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InsightsData {
  summary: string;
  tips: string[];
  insights: string[];
  motivation: string;
}

interface SpendingInsightsProps {
  expenses: Array<{
    description: string;
    amount: number;
    category: string;
  }>;
  totalSpent: number;
  categories: Record<string, number>;
}

export function SpendingInsights({ expenses, totalSpent, categories }: SpendingInsightsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to get insights');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spending-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            expenses: expenses.slice(0, 20), // Limit to recent 20
            totalSpent,
            categories,
            timeframe: 'past month',
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate insights');
      }

      setInsights(result.data);
      setIsExpanded(true);
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">AI Spending Insights</h3>
            <p className="text-xs text-muted-foreground">Get personalized budgeting tips</p>
          </div>
          <Button
            onClick={generateInsights}
            variant="gradient"
            size="sm"
            disabled={isLoading || expenses.length === 0}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze
              </>
            )}
          </Button>
        </div>
        {expenses.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Add some expenses first to get insights
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden"
    >
      {/* Header */}
      <div className="gradient-primary p-4 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">AI Insights</h3>
              <p className="text-xs opacity-80">Personalized for you</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {insights && (
        <div className="p-4 space-y-4">
          {/* Summary */}
          <div>
            <p className="text-foreground">{insights.summary}</p>
          </div>

          {/* Tips */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-warning" />
              <span className="font-semibold text-foreground text-sm">Money-Saving Tips</span>
            </div>
            <div className="space-y-2">
              {insights.tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 bg-secondary rounded-xl p-3"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm text-foreground">{tip}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Insights */}
          {insights.insights.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">Spending Patterns</span>
              </div>
              <div className="space-y-1">
                {insights.insights.map((insight, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    • {insight}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Motivation */}
          <div className="bg-success/10 rounded-xl p-3 text-center">
            <p className="text-success text-sm font-medium">{insights.motivation}</p>
          </div>

          {/* Refresh */}
          <Button
            onClick={generateInsights}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh Insights
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
}

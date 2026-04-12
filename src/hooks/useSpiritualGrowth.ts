import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';

export interface ReflectionAnalysis {
  id: string;
  entry_id: string | null;
  entry_date: string;
  reflection_text: string | null;
  detected_emotions: string[];
  detected_virtues: string[];
  detected_struggles: string[];
  emotional_tone: string | null;
  ai_summary: string | null;
  affirmation: string | null;
  gentle_correction: string | null;
  scripture: string | null;
  actionable_step: string | null;
  personalized_prayer: string | null;
  created_at: string;
}

export interface SpiritualPattern {
  id: string;
  analysis_period_start: string;
  analysis_period_end: string;
  recurring_struggles: any[];
  growing_virtues: any[];
  common_triggers: any[];
  emotional_trends: any[];
  entry_count: number;
  created_at: string;
}

export interface WeeklyReport {
  id: string;
  week_start: string;
  week_end: string;
  overall_summary: string | null;
  growth_areas: string | null;
  struggle_patterns: string | null;
  divine_invitation: string | null;
  weekly_focus: string | null;
  full_report: any;
  created_at: string;
}

export interface GrowthPlan {
  id: string;
  title: string;
  day1_action: string | null;
  day2_action: string | null;
  day3_action: string | null;
  scripture_anchor: string | null;
  plan_prayer: string | null;
  focus_area: string | null;
  is_active: boolean;
  start_date: string;
  created_at: string;
}

export function useSpiritualGrowth() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<ReflectionAnalysis[]>([]);
  const [patterns, setPatterns] = useState<SpiritualPattern | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const [analRes, patRes, repRes, planRes] = await Promise.all([
      supabase.from('reflection_analyses').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(30),
      supabase.from('spiritual_patterns').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('weekly_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('growth_plans').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at', { ascending: false }).limit(1),
    ]);

    if (analRes.data) setAnalyses(analRes.data as any);
    if (patRes.data?.[0]) setPatterns(patRes.data[0] as any);
    if (repRes.data?.[0]) setWeeklyReport(repRes.data[0] as any);
    if (planRes.data?.[0]) setGrowthPlan(planRes.data[0] as any);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const callEdgeFunction = async (action: string, extra: Record<string, any> = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spiritual-growth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action, guide: profile?.spiritual_guide, ...extra }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      if (resp.status === 429) toast({ title: "Rate Limited", description: "Please try again in a moment.", variant: "destructive" });
      else if (resp.status === 402) toast({ title: "Credits Needed", description: "Please add funds to continue.", variant: "destructive" });
      else toast({ title: "Error", description: err.error || "Something went wrong.", variant: "destructive" });
      return null;
    }
    return resp.json();
  };

  const analyzeReflection = async (reflectionText: string, entryId?: string, entryDate?: string) => {
    setActionLoading('analyze');
    try {
      const result = await callEdgeFunction('analyze_reflection', { reflection_text: reflectionText, entry_id: entryId, entry_date: entryDate });
      if (result?.analysis) {
        setAnalyses(prev => [result.analysis, ...prev]);
        return result.analysis as ReflectionAnalysis;
      }
      return null;
    } finally {
      setActionLoading(null);
    }
  };

  const generatePatterns = async () => {
    setActionLoading('patterns');
    try {
      const result = await callEdgeFunction('generate_patterns');
      if (result?.patterns) {
        setPatterns(result.patterns);
        return result.patterns as SpiritualPattern;
      }
      return null;
    } finally {
      setActionLoading(null);
    }
  };

  const generateWeeklyReport = async () => {
    setActionLoading('report');
    try {
      const result = await callEdgeFunction('generate_weekly_report');
      if (result?.report) {
        setWeeklyReport(result.report);
        return result.report as WeeklyReport;
      }
      return null;
    } finally {
      setActionLoading(null);
    }
  };

  const generateGrowthPlan = async () => {
    setActionLoading('plan');
    try {
      const result = await callEdgeFunction('generate_growth_plan');
      if (result?.plan) {
        setGrowthPlan(result.plan);
        return result.plan as GrowthPlan;
      }
      return null;
    } finally {
      setActionLoading(null);
    }
  };

  return {
    analyses, patterns, weeklyReport, growthPlan,
    loading, actionLoading,
    analyzeReflection, generatePatterns, generateWeeklyReport, generateGrowthPlan,
    refetch: fetchAll,
    entryCount: analyses.length,
    hasEnoughForPatterns: analyses.length >= 5,
  };
}

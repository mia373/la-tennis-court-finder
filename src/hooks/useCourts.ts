import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Court } from '@/types/court';

export const useCourts = () => {
  return useQuery<Court[]>({
    queryKey: ['courts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_court_availability')
        .select('*')
        .order('name');

      if (error) throw error;
      // Ensure status typing
      return (data ?? []).map((row) => ({
        ...row,
        court_source_id: row.court_source_id ?? '',
        name: row.name ?? '',
        area: row.area ?? '',
        source_url: row.source_url ?? '',
        booking_url: row.booking_url ?? '',
        is_active: row.is_active ?? true,
        status: (row.status as Court['status']) ?? null,
        details: (row.details as Record<string, unknown>) ?? null,
      })) as Court[];
    },
    refetchInterval: 5 * 60 * 1000,
  });
};

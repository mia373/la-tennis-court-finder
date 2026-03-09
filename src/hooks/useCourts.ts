import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Court } from '@/types/court';

export const useCourts = () => {
  return useQuery({
    queryKey: ['courts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_court_availability')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return data as Court[];
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
};

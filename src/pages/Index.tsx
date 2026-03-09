import { useState, useMemo } from 'react';
import { RefreshCw, List, Map as MapIcon, Activity, Zap, Trophy, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourtList } from '@/components/CourtList';
import { CourtMap } from '@/components/CourtMap';
import { useCourts } from '@/hooks/useCourts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { data: courts, isLoading, refetch, isRefetching } = useCourts();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('list');
  const [isScraping, setIsScraping] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'limited' | 'full'>('all');

  const filteredCourts = useMemo(() => {
    if (!courts) return [];
    if (statusFilter === 'all') return courts;
    return courts.filter((c) => c.status === statusFilter);
  }, [courts, statusFilter]);

  const handleRefresh = async () => {
    await refetch();
    toast({ title: 'Refreshed', description: 'Court availability data has been updated.' });
  };

  const handleScrape = async () => {
    setIsScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-courts');
      if (error) throw error;
      await refetch();
      const successCount = data?.results?.filter((r: { status: string }) => r.status !== 'error').length ?? 0;
      toast({ title: 'Scraping complete', description: `Updated ${successCount} courts.` });
    } catch (err) {
      toast({ title: 'Scraping failed', description: String(err), variant: 'destructive' });
    } finally {
      setIsScraping(false);
    }
  };

  const availableCount = courts?.filter((c) => c.status === 'available').length ?? 0;
  const limitedCount = courts?.filter((c) => c.status === 'limited').length ?? 0;

  return (
    <div className="min-h-screen bg-background sport-stripe">
      {/* Hero header */}
      <div className="bg-foreground text-primary-foreground">
        <div className="container max-w-5xl py-8 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary">
                  <Trophy className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">
                    West LA Courts
                  </h1>
                  <p className="text-primary-foreground/60 text-sm font-medium uppercase tracking-widest">
                    Live Tennis Court Availability
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 pt-2">
              <Button
                onClick={handleRefresh}
                disabled={isRefetching}
                variant="outline"
                size="icon"
                className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={handleScrape}
                disabled={isScraping}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold uppercase tracking-wide text-xs"
              >
                <Zap className={`h-4 w-4 mr-1.5 ${isScraping ? 'animate-pulse-live' : ''}`} />
                {isScraping ? 'Scanning...' : 'Live Check'}
              </Button>
            </div>
          </div>

          {/* Filter bar */}
          {!isLoading && courts && courts.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors font-display text-sm font-semibold uppercase cursor-pointer ${
                  statusFilter === 'all' ? 'bg-primary-foreground/25 ring-1 ring-primary-foreground/40' : 'bg-primary-foreground/10 hover:bg-primary-foreground/15'
                }`}
              >
                <Filter className="h-3 w-3" />
                All ({courts.length})
              </button>
              <button
                onClick={() => setStatusFilter('available')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors font-display text-sm font-semibold uppercase cursor-pointer ${
                  statusFilter === 'available' ? 'bg-primary-foreground/25 ring-1 ring-primary-foreground/40' : 'bg-primary-foreground/10 hover:bg-primary-foreground/15'
                }`}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-court-available animate-pulse-live" />
                Open ({availableCount})
              </button>
              <button
                onClick={() => setStatusFilter('limited')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors font-display text-sm font-semibold uppercase cursor-pointer ${
                  statusFilter === 'limited' ? 'bg-primary-foreground/25 ring-1 ring-primary-foreground/40' : 'bg-primary-foreground/10 hover:bg-primary-foreground/15'
                }`}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-court-limited" />
                Limited ({limitedCount})
              </button>
              <button
                onClick={() => setStatusFilter('full')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors font-display text-sm font-semibold uppercase cursor-pointer ${
                  statusFilter === 'full' ? 'bg-primary-foreground/25 ring-1 ring-primary-foreground/40' : 'bg-primary-foreground/10 hover:bg-primary-foreground/15'
                }`}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-court-full" />
                Full ({courts.filter((c) => c.status === 'full').length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="container max-w-5xl py-8 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-xs grid-cols-2 bg-secondary">
            <TabsTrigger value="list" className="flex items-center gap-2 font-display uppercase text-sm font-semibold tracking-wide">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2 font-display uppercase text-sm font-semibold tracking-wide">
              <MapIcon className="h-4 w-4" />
              Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-36 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredCourts.length > 0 ? (
              <CourtList courts={filteredCourts} />
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="font-display text-lg uppercase">No courts found</p>
                <p className="text-sm mt-1">Click <strong>Live Check</strong> to fetch live data.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            {isLoading ? (
              <div className="h-[500px] rounded-lg bg-muted animate-pulse" />
            ) : courts && courts.length > 0 ? (
              <CourtMap courts={courts} />
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p className="font-display text-lg uppercase">No courts found</p>
                <p className="text-sm mt-1">Click <strong>Live Check</strong> to fetch live data.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-6 border-t font-medium uppercase tracking-wider">
          <p>Auto-refresh every 5 min · Official booking links only</p>
        </div>
      </div>
    </div>
  );
};

export default Index;

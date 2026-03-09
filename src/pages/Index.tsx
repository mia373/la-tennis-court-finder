import { useState } from 'react';
import { RefreshCw, List, Map as MapIcon, Activity } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-10 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">🎾 West LA Tennis Courts</h1>
              <p className="text-muted-foreground mt-1 text-base">
                Live availability for top courts in West Los Angeles
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button onClick={handleRefresh} disabled={isRefetching} variant="outline" size="icon">
                <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={handleScrape} disabled={isScraping} variant="outline" size="sm">
                <Activity className={`h-4 w-4 mr-2 ${isScraping ? 'animate-pulse' : ''}`} />
                {isScraping ? 'Checking...' : 'Check Now'}
              </Button>
            </div>
          </div>

          {/* Summary stats */}
          {!isLoading && courts && courts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="gap-1">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                {availableCount} Available
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                {limitedCount} Limited
              </Badge>
              <Badge variant="outline" className="gap-1">
                {courts.length} Total Courts
              </Badge>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
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
            ) : courts && courts.length > 0 ? (
              <CourtList courts={courts} />
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p>No courts found. Click <strong>Check Now</strong> to fetch live data.</p>
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
                <p>No courts found. Click <strong>Check Now</strong> to fetch live data.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-6 border-t">
          <p>Data refreshes automatically every 5 minutes · All booking links go to official websites</p>
        </div>
      </div>
    </div>
  );
};

export default Index;

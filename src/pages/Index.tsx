import { useState } from 'react';
import { RefreshCw, List, Map as MapIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CourtList } from '@/components/CourtList';
import { CourtMap } from '@/components/CourtMap';
import { useCourts } from '@/hooks/useCourts';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { data: courts, isLoading, refetch, isRefetching } = useCourts();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('list');

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: 'Refreshed',
      description: 'Court availability data has been updated.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">West LA Tennis Courts</h1>
              <p className="text-muted-foreground mt-2">
                Live availability for top 5 tennis courts in West Los Angeles
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefetching}
              variant="outline"
              size="icon"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Tabs for List/Map */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading courts...
              </div>
            ) : courts && courts.length > 0 ? (
              <CourtList courts={courts} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No courts available at the moment.
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading courts...
              </div>
            ) : courts && courts.length > 0 ? (
              <CourtMap courts={courts} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No courts available at the moment.
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>Data refreshes automatically every 5-15 minutes</p>
          <p className="mt-1">Click on any court to book directly on the official website</p>
        </div>
      </div>
    </div>
  );
};

export default Index;

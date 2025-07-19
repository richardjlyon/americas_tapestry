'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import type { TapestryEntry } from '@/lib/tapestries';

// Define the structure for aggregated colony data
interface ColonyData {
  name: string;
  slug: string;
  status: string;
  eventCount: number;
  earliestEvent: string;
  latestEvent: string;
  summary: string;
}

// Define available sort fields
type SortField = 'name' | 'status' | 'eventCount' | 'earliestEvent';

interface ColonialDataExplorerProps {
  tapestries: TapestryEntry[];
}

export function ColonialDataExplorer({
  tapestries,
}: ColonialDataExplorerProps) {
  // State management
  const [activeView, setActiveView] = useState<'timeline' | 'grid' | 'summary'>(
    'summary',
  );
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Process and aggregate colony data
  const colonyData: ColonyData[] = useMemo(() => {
    return tapestries.map((tapestry) => {
      const events = tapestry.timelineEvents || [];
      const sortedEvents = [...events].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      return {
        name: tapestry.title,
        slug: tapestry.slug,
        status: tapestry.status,
        eventCount: events.length,
        earliestEvent: sortedEvents[0]?.date || 'N/A',
        latestEvent: sortedEvents[sortedEvents.length - 1]?.date || 'N/A',
        summary: tapestry.summary,
      };
    });
  }, [tapestries]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...colonyData];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((colony) => colony.status === filterStatus);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (colony) =>
          colony.name.toLowerCase().includes(query) ||
          colony.summary.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'eventCount':
          comparison = a.eventCount - b.eventCount;
          break;
        case 'earliestEvent':
          comparison =
            new Date(a.earliestEvent).getTime() -
            new Date(b.earliestEvent).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [colonyData, filterStatus, searchQuery, sortField, sortDirection]);

  // Calculate summary statistics
  const statistics = useMemo(() => {
    const totalEvents = colonyData.reduce(
      (sum, colony) => sum + colony.eventCount,
      0,
    );
    const avgEventsPerColony = totalEvents / colonyData.length;
    const earliestOverall = colonyData.reduce((earliest, colony) => {
      if (colony.earliestEvent === 'N/A') return earliest;
      return earliest === 'N/A' ||
        new Date(colony.earliestEvent) < new Date(earliest)
        ? colony.earliestEvent
        : earliest;
    }, 'N/A');

    return {
      totalColonies: colonyData.length,
      totalEvents,
      avgEventsPerColony,
      earliestOverall,
    };
  }, [colonyData]);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (dateString === 'N/A') return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 w-full sm:w-auto">
          <Input
            placeholder="Search colonies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="Designed">Designed</SelectItem>
              <SelectItem value="In Production">In Production</SelectItem>
              <SelectItem value="Finished">Finished</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
            }
            className="flex-shrink-0"
          >
            {sortDirection === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* View Selection Tabs */}
      <Tabs
        value={activeView}
        onValueChange={(value: any) => setActiveView(value)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="grid">Data Grid</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Summary View */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <h3 className="text-sm font-medium text-colonial-navy/70">
                Total Colonies
              </h3>
              <p className="text-2xl font-bold text-colonial-navy mt-1">
                {statistics.totalColonies}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium text-colonial-navy/70">
                Total Events
              </h3>
              <p className="text-2xl font-bold text-colonial-navy mt-1">
                {statistics.totalEvents}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium text-colonial-navy/70">
                Avg Events per Colony
              </h3>
              <p className="text-2xl font-bold text-colonial-navy mt-1">
                {statistics.avgEventsPerColony.toFixed(1)}
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-medium text-colonial-navy/70">
                Earliest Event
              </h3>
              <p className="text-2xl font-bold text-colonial-navy mt-1">
                {formatDate(statistics.earliestOverall)}
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((colony) => (
              <Card key={colony.slug} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-colonial-navy">
                    {colony.name}
                  </h3>
                  <Badge
                    variant={
                      colony.status === 'Finished' ? 'default' : 'outline'
                    }
                  >
                    {colony.status}
                  </Badge>
                </div>
                <p className="text-sm text-colonial-navy/70 mb-3">
                  {colony.summary}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-colonial-navy/60">
                    Events: {colony.eventCount}
                  </span>
                  <span className="text-colonial-navy/60">
                    First: {formatDate(colony.earliestEvent)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Data Grid View */}
        <TabsContent value="grid">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSortField('name');
                        setSortDirection((prev) =>
                          prev === 'asc' ? 'desc' : 'asc',
                        );
                      }}
                      className="font-bold"
                    >
                      Colony Name
                      {sortField === 'name' &&
                        (sortDirection === 'asc' ? (
                          <SortAsc className="ml-2 h-4 w-4 inline" />
                        ) : (
                          <SortDesc className="ml-2 h-4 w-4 inline" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSortField('status');
                        setSortDirection((prev) =>
                          prev === 'asc' ? 'desc' : 'asc',
                        );
                      }}
                      className="font-bold"
                    >
                      Status
                      {sortField === 'status' &&
                        (sortDirection === 'asc' ? (
                          <SortAsc className="ml-2 h-4 w-4 inline" />
                        ) : (
                          <SortDesc className="ml-2 h-4 w-4 inline" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSortField('eventCount');
                        setSortDirection((prev) =>
                          prev === 'asc' ? 'desc' : 'asc',
                        );
                      }}
                      className="font-bold"
                    >
                      Events
                      {sortField === 'eventCount' &&
                        (sortDirection === 'asc' ? (
                          <SortAsc className="ml-2 h-4 w-4 inline" />
                        ) : (
                          <SortDesc className="ml-2 h-4 w-4 inline" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSortField('earliestEvent');
                        setSortDirection((prev) =>
                          prev === 'asc' ? 'desc' : 'asc',
                        );
                      }}
                      className="font-bold"
                    >
                      First Event
                      {sortField === 'earliestEvent' &&
                        (sortDirection === 'asc' ? (
                          <SortAsc className="ml-2 h-4 w-4 inline" />
                        ) : (
                          <SortDesc className="ml-2 h-4 w-4 inline" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead>Latest Event</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((colony) => (
                  <TableRow key={colony.slug}>
                    <TableCell className="font-medium">{colony.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          colony.status === 'Finished' ? 'default' : 'outline'
                        }
                      >
                        {colony.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{colony.eventCount}</TableCell>
                    <TableCell>{formatDate(colony.earliestEvent)}</TableCell>
                    <TableCell>{formatDate(colony.latestEvent)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline">
          <div className="space-y-8">
            {filteredData.map((colony) => {
              const tapestry = tapestries.find((t) => t.slug === colony.slug);
              if (!tapestry || !tapestry.timelineEvents) return null;

              return (
                <Card key={colony.slug} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-colonial-navy">
                        {colony.name}
                      </h3>
                      <p className="text-sm text-colonial-navy/70">
                        {colony.summary}
                      </p>
                    </div>
                    <Badge
                      variant={
                        colony.status === 'Finished' ? 'default' : 'outline'
                      }
                    >
                      {colony.status}
                    </Badge>
                  </div>

                  <div className="relative">
                    <div className="absolute h-0.5 bg-colonial-navy/20 top-4 left-0 right-0" />
                    <div className="relative flex justify-between">
                      {tapestry.timelineEvents.map((event, index) => (
                        <div
                          key={index}
                          className="relative flex flex-col items-center"
                          style={{
                            left: `${(index / (tapestry.timelineEvents.length - 1)) * 100}%`,
                            position: 'absolute',
                            transform: 'translateX(-50%)',
                          }}
                        >
                          <div className="w-2 h-2 rounded-full bg-colonial-burgundy" />
                          <div className="mt-4 text-center">
                            <p className="text-xs font-medium text-colonial-navy">
                              {new Date(event.date).getFullYear()}
                            </p>
                            <p className="text-xs text-colonial-navy/70 mt-1 max-w-[100px] truncate">
                              {event.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

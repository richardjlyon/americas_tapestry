'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { cn } from '@/lib/utils';
import type { TapestryEntry } from '@/lib/tapestries';

// Define the structure for timeline events
interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  colonySlug: string;
  colonyName: string;
}

interface InteractiveTimelineProps {
  tapestries: TapestryEntry[];
}

export function InteractiveTimeline({ tapestries }: InteractiveTimelineProps) {
  const [activeEvent, setActiveEvent] = useState<TimelineEvent | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [allEvents, setAllEvents] = useState<TimelineEvent[]>([]);
  const [colonies, setColonies] = useState<{ name: string; slug: string }[]>(
    [],
  );
  const [selectedColony, setSelectedColony] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Load all timeline events from tapestries
  useEffect(() => {
    const events: TimelineEvent[] = [];
    const coloniesList: { name: string; slug: string }[] = [];

    for (const tapestry of tapestries) {
      if (tapestry.timelineEvents && Array.isArray(tapestry.timelineEvents)) {
        for (const event of tapestry.timelineEvents as Omit<
          TimelineEvent,
          'colonySlug' | 'colonyName'
        >[]) {
          events.push({
            ...event,
            colonySlug: tapestry.slug,
            colonyName: tapestry.title,
          });
        }

        // Add to colonies list if not already included
        if (!coloniesList.some((c) => c.slug === tapestry.slug)) {
          coloniesList.push({
            name: tapestry.title,
            slug: tapestry.slug,
          });
        }
      }
    }

    // Sort events chronologically
    const sortedEvents = events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    setAllEvents(sortedEvents);
    setColonies(coloniesList);

    // Set the first event as active by default
    if (sortedEvents.length > 0 && sortedEvents[0]) {
      setActiveEvent(sortedEvents[0]);
    }
  }, [tapestries]);

  // Get earliest and latest dates for scaling
  const earliestDate = useMemo(
    () =>
      allEvents.length > 0 && allEvents[0]
        ? new Date(allEvents[0].date)
        : new Date(1600, 0, 1),
    [allEvents],
  );
  const lastEvent =
    allEvents.length > 0 ? allEvents[allEvents.length - 1] : null;
  const latestDate = lastEvent
    ? new Date(lastEvent.date)
    : new Date(1800, 0, 1);
  const timespan = latestDate.getTime() - earliestDate.getTime();

  // Calculate position along timeline based on date
  const getPositionFromDate = useCallback(
    (dateString: string) => {
      const date = new Date(dateString);
      return ((date.getTime() - earliestDate.getTime()) / timespan) * 100;
    },
    [earliestDate, timespan],
  );

  // Handle scrolling along the timeline
  const handleScroll = useCallback(() => {
    if (!timelineRef.current || isScrolling || allEvents.length === 0) return;

    const scrollPosition = timelineRef.current.scrollLeft;
    const timelineWidth =
      timelineRef.current.scrollWidth - timelineRef.current.clientWidth;
    const scrollPercentage = scrollPosition / timelineWidth;

    // Find the event closest to current scroll position
    let closestEventIndex = 0;
    let smallestDifference = 1;

    const filteredEvents = selectedColony
      ? allEvents.filter((event) => event.colonySlug === selectedColony)
      : allEvents;

    if (filteredEvents.length === 0) return;

    for (const [index, event] of filteredEvents.entries()) {
      const eventPosition = getPositionFromDate(event.date) / 100;
      const difference = Math.abs(eventPosition - scrollPercentage);

      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestEventIndex = index;
      }
    }

    const closestEvent = filteredEvents[closestEventIndex];
    if (closestEvent) {
      setActiveEvent(closestEvent);
    }
  }, [isScrolling, allEvents, selectedColony, getPositionFromDate]);

  // Scroll to specific event
  const scrollToEvent = (event: TimelineEvent) => {
    if (!timelineRef.current) return;

    setIsScrolling(true);
    setActiveEvent(event);

    const position =
      (getPositionFromDate(event.date) / 100) *
      (timelineRef.current.scrollWidth - timelineRef.current.clientWidth);

    timelineRef.current.scrollTo({
      left: position,
      behavior: 'smooth',
    });

    // Reset scrolling flag after animation
    setTimeout(() => setIsScrolling(false), 1000);
  };

  // Navigate to next/previous event
  const navigateEvent = (direction: 'prev' | 'next') => {
    if (!activeEvent || allEvents.length === 0) return;

    const filteredEvents = selectedColony
      ? allEvents.filter((event) => event.colonySlug === selectedColony)
      : allEvents;

    const currentIndex = filteredEvents.findIndex(
      (event) =>
        event.date === activeEvent.date && event.title === activeEvent.title,
    );

    if (currentIndex === -1) return;

    const newIndex =
      direction === 'next'
        ? Math.min(currentIndex + 1, filteredEvents.length - 1)
        : Math.max(currentIndex - 1, 0);

    const eventToScrollTo = filteredEvents[newIndex];
    if (eventToScrollTo) {
      scrollToEvent(eventToScrollTo);
    }
  };

  // Filter events by colony
  const filterByColony = (colonySlug: string | null) => {
    setSelectedColony(colonySlug);

    // If clearing filter, keep current active event
    if (colonySlug === null) {
      return;
    }

    // Otherwise, find first event for selected colony
    const colonyEvents = allEvents.filter(
      (event) => event.colonySlug === colonySlug,
    );
    if (colonyEvents.length > 0 && colonyEvents[0]) {
      scrollToEvent(colonyEvents[0]);
    }
  };

  // Monitor scroll events
  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const handleScrollEvent = () => {
      if (!isScrolling) {
        handleScroll();
      }
    };

    timeline.addEventListener('scroll', handleScrollEvent);
    return () => timeline.removeEventListener('scroll', handleScrollEvent);
  }, [isScrolling, handleScroll]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get filtered events based on selected colony
  const filteredEvents = selectedColony
    ? allEvents.filter((event) => event.colonySlug === selectedColony)
    : allEvents;

  return (
    <>
      <SectionHeader
        title="Colonial America Timeline"
        description="Explore key events in colonial American history and see how they connect to our tapestry collection."
      />

      <div className="w-full flex flex-col mt-8">
        {/* Active Event Display */}
        <div className="bg-colonial-parchment p-4 md:p-6 rounded-lg shadow-md mb-6 min-h-[200px]">
          {activeEvent ? (
            <div className="flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-colonial-navy">
                    {activeEvent.title}
                  </h3>
                  <p className="text-sm text-colonial-navy/70 mt-1">
                    {formatDate(activeEvent.date)} • {activeEvent.colonyName}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateEvent('prev')}
                    disabled={filteredEvents.indexOf(activeEvent) === 0}
                    className="h-8 w-8 rounded-full"
                    aria-label="Previous event"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateEvent('next')}
                    disabled={
                      filteredEvents.indexOf(activeEvent) ===
                      filteredEvents.length - 1
                    }
                    className="h-8 w-8 rounded-full"
                    aria-label="Next event"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-colonial-navy/80 mt-2">
                {activeEvent.description}
              </p>
              <div className="mt-4">
                <Link
                  href={`/tapestries/${activeEvent.colonySlug}`}
                  className="text-sm font-medium text-colonial-burgundy hover:text-colonial-burgundy/80 transition-colors"
                >
                  View {activeEvent.colonyName} Tapestry →
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[150px]">
              <p className="text-colonial-navy/50">
                No timeline events available
              </p>
            </div>
          )}
        </div>

        {/* Colony Filter */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant={selectedColony === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => filterByColony(null)}
            className={cn(
              'text-xs',
              selectedColony === null
                ? 'bg-colonial-navy text-white'
                : 'text-colonial-navy',
            )}
          >
            All Colonies
          </Button>
          {colonies.map((colony) => (
            <Button
              key={colony.slug}
              variant={selectedColony === colony.slug ? 'default' : 'outline'}
              size="sm"
              onClick={() => filterByColony(colony.slug)}
              className={cn(
                'text-xs',
                selectedColony === colony.slug
                  ? 'bg-colonial-navy text-white'
                  : 'text-colonial-navy',
              )}
            >
              {colony.name}
            </Button>
          ))}
        </div>

        {/* Timeline */}
        <div
          ref={timelineRef}
          className="relative w-full overflow-x-auto pb-8 hide-scrollbar"
          style={{ overscrollBehaviorX: 'contain' }}
        >
          <div className="relative min-w-full" style={{ height: '120px' }}>
            {/* Timeline Track */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-colonial-navy/20 -translate-y-1/2" />

            {/* Year Markers */}
            {Array.from({ length: 11 }).map((_, i) => {
              const year = 1600 + i * 20;
              const position = ((year - 1600) / 200) * 100;
              return (
                <div
                  key={year}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${position}%` }}
                >
                  <div className="h-3 w-1 bg-colonial-navy/40" />
                  <div className="text-xs text-colonial-navy/60 mt-1">
                    {year}
                  </div>
                </div>
              );
            })}

            {/* Event Markers */}
            {filteredEvents.map((event, index) => {
              const position = getPositionFromDate(event.date);
              const isActive =
                activeEvent &&
                activeEvent.date === event.date &&
                activeEvent.title === event.title;

              return (
                <button
                  type="button"
                  key={`${event.date}-${index}`}
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-300 ease-in-out',
                    isActive
                      ? 'bg-colonial-burgundy scale-125 z-10'
                      : 'bg-colonial-navy hover:scale-110',
                  )}
                  style={{ left: `${position}%` }}
                  onClick={() => scrollToEvent(event)}
                  aria-label={`${event.title} - ${formatDate(event.date)}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

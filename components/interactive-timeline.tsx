'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

    tapestries.forEach((tapestry) => {
      if (tapestry.timelineEvents && Array.isArray(tapestry.timelineEvents)) {
        tapestry.timelineEvents.forEach((event: any) => {
          events.push({
            ...event,
            colonySlug: tapestry.slug,
            colonyName: tapestry.title,
          });
        });

        // Add to colonies list if not already included
        if (!coloniesList.some((c) => c.slug === tapestry.slug)) {
          coloniesList.push({
            name: tapestry.title,
            slug: tapestry.slug,
          });
        }
      }
    });

    // Sort events chronologically
    const sortedEvents = events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    setAllEvents(sortedEvents);
    setColonies(coloniesList);

    // Set the first event as active by default
    if (sortedEvents.length > 0) {
      setActiveEvent(sortedEvents[0]);
    }
  }, [tapestries]);

  // Get earliest and latest dates for scaling
  const earliestDate =
    allEvents.length > 0 ? new Date(allEvents[0].date) : new Date(1600, 0, 1);
  const latestDate =
    allEvents.length > 0
      ? new Date(allEvents[allEvents.length - 1].date)
      : new Date(1800, 0, 1);
  const timespan = latestDate.getTime() - earliestDate.getTime();

  // Calculate position along timeline based on date
  const getPositionFromDate = (dateString: string) => {
    const date = new Date(dateString);
    return ((date.getTime() - earliestDate.getTime()) / timespan) * 100;
  };

  // Handle scrolling along the timeline
  const handleScroll = () => {
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

    filteredEvents.forEach((event, index) => {
      const eventPosition = getPositionFromDate(event.date) / 100;
      const difference = Math.abs(eventPosition - scrollPercentage);

      if (difference < smallestDifference) {
        smallestDifference = difference;
        closestEventIndex = index;
      }
    });

    setActiveEvent(filteredEvents[closestEventIndex]);
  };

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

    scrollToEvent(filteredEvents[newIndex]);
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
    if (colonyEvents.length > 0) {
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
  }, [isScrolling, allEvents, selectedColony]);

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
    <div className="w-full flex flex-col">
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
                  size="sm"
                  onClick={() => navigateEvent('prev')}
                  disabled={filteredEvents.indexOf(activeEvent) === 0}
                  className="h-8 w-8 p-0 rounded-full"
                  aria-label="Previous event"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateEvent('next')}
                  disabled={
                    filteredEvents.indexOf(activeEvent) ===
                    filteredEvents.length - 1
                  }
                  className="h-8 w-8 p-0 rounded-full"
                  aria-label="Next event"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="font-serif text-colonial-navy/80 mt-2">
              {activeEvent.description}
            </p>
            <div className="mt-4">
              <Link
                href={`/tapestry/${activeEvent.colonySlug}`}
                className="text-colonial-burgundy hover:text-colonial-navy transition-colors font-medium"
              >
                View {activeEvent.colonyName} Tapestry →
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-center text-colonial-navy/70 italic">
            Scroll through the timeline to explore historical events
          </p>
        )}
      </div>

      {/* Timeline Scroll Area */}
      <div
        ref={timelineRef}
        className="relative w-full overflow-x-auto pb-12 border-t border-b border-colonial-navy/20 bg-colonial-stone/50"
        style={{ height: '180px' }}
      >
        {/* Timeline Bar */}
        <div
          className="absolute h-2 bg-colonial-navy/30 top-16"
          style={{ width: '100%', minWidth: '2000px' }}
        >
          {/* Timeline Events */}
          {filteredEvents.map((event, index) => (
            <div
              key={`${event.colonySlug}-${index}`}
              className="absolute"
              style={{
                left: `${getPositionFromDate(event.date)}%`,
                transform: 'translateX(-50%)',
                top: '-10px',
              }}
            >
              <button
                onClick={() => scrollToEvent(event)}
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                  activeEvent &&
                    activeEvent.date === event.date &&
                    activeEvent.title === event.title
                    ? 'bg-colonial-burgundy border-colonial-burgundy'
                    : 'bg-white border-colonial-navy/40 hover:border-colonial-burgundy',
                )}
                aria-label={event.title}
              >
                <span className="sr-only">{event.title}</span>
              </button>
              <div className="absolute whitespace-nowrap -mt-8 transform -translate-x-1/2 left-1/2">
                <p className="text-xs font-medium text-colonial-navy">
                  {new Date(event.date).getFullYear()}
                </p>
              </div>
              <div className="absolute whitespace-nowrap mt-8 transform -translate-x-1/2 left-1/2 max-w-[150px] overflow-hidden text-ellipsis">
                <p className="text-xs text-colonial-navy/80 text-center">
                  {event.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Colony Filters */}
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <Button
          onClick={() => filterByColony(null)}
          variant={selectedColony === null ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'rounded-full',
            selectedColony === null
              ? 'bg-colonial-navy text-colonial-parchment'
              : 'text-colonial-navy hover:text-colonial-burgundy',
          )}
        >
          All Colonies
        </Button>
        {colonies.map((colony) => (
          <Button
            key={colony.slug}
            onClick={() => filterByColony(colony.slug)}
            variant={selectedColony === colony.slug ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'rounded-full',
              selectedColony === colony.slug
                ? 'bg-colonial-burgundy text-colonial-parchment'
                : 'text-colonial-navy hover:text-colonial-burgundy',
            )}
          >
            {colony.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

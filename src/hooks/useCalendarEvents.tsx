
import { useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { format, endOfDay } from 'date-fns';

// Define event types based on the API response
export type CalendarAttendee = {
  email?: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
};

export type CalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  status: string;
  htmlLink: string;
  attendees?: (CalendarAttendee | null)[];
};

export function useCalendarEvents(selectedDate?: Date | null) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      // Format date parameters for the API
      let url = 'https://webhook.n8nlabz.com.br/webhook/agenda';
      
      // If a date is selected, add query parameters for start and end dates
      if (selectedDate) {
        const startDateTime = format(selectedDate, "yyyy-MM-dd'T'00:00:00.000xxx");
        const endDateTime = format(endOfDay(selectedDate), "yyyy-MM-dd'T'23:59:59.999xxx");
        
        url += `?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`;
        console.log('Fetching events with date range:', { startDateTime, endDateTime });
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      // Only show the toast if we don't already have events loaded
      if (events.length === 0) {
        toast.error("Não conseguimos atualizar os eventos, tentando novamente em breve...");
      }
    } finally {
      setIsLoading(false);
    }
  }, [events.length, selectedDate]);

  // Initial fetch on mount or when selected date changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, selectedDate]);

  // Setup polling every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('Polling for calendar events...');
      fetchEvents();
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [fetchEvents]);

  return { events, isLoading, error, lastUpdated, refreshEvents: fetchEvents };
}

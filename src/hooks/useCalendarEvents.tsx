
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
  description?: string;
  attendees?: (CalendarAttendee | null)[];
};

export type EventFormData = {
  summary: string;
  description: string;
  email: string;
  date: Date;
  startTime: string;
  endTime: string;
};

export function useCalendarEvents(selectedDate?: Date | null) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Add a new event
  const addEvent = async (formData: EventFormData) => {
    setIsSubmitting(true);
    try {
      // Format the date and times for the API
      const { date, startTime, endTime, summary, description, email } = formData;
      const dateStr = format(date, "yyyy-MM-dd");
      
      const startDateTime = `${dateStr}T${startTime}:00-03:00`;
      const endDateTime = `${dateStr}T${endTime}:00-03:00`;
      
      const payload = {
        summary,
        description,
        start: startDateTime,
        end: endDateTime,
        email
      };
      
      console.log('Adding event with payload:', payload);
      
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/agenda/adicionar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      toast.success("Evento adicionado com sucesso!");
      await fetchEvents(); // Refresh events
      return true;
    } catch (err) {
      console.error('Error adding event:', err);
      toast.error("Erro ao adicionar evento. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit an existing event
  const editEvent = async (eventId: string, formData: EventFormData) => {
    setIsSubmitting(true);
    try {
      // Format the date and times for the API
      const { date, startTime, endTime, summary, description, email } = formData;
      const dateStr = format(date, "yyyy-MM-dd");
      
      const startDateTime = `${dateStr}T${startTime}:00-03:00`;
      const endDateTime = `${dateStr}T${endTime}:00-03:00`;
      
      const payload = {
        id: eventId,
        summary,
        description,
        start: startDateTime,
        end: endDateTime,
        email
      };
      
      console.log('Updating event with payload:', payload);
      
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/agenda/alterar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      toast.success("Evento atualizado com sucesso!");
      await fetchEvents(); // Refresh events
      return true;
    } catch (err) {
      console.error('Error updating event:', err);
      toast.error("Erro ao atualizar evento. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an event
  const deleteEvent = async (eventId: string) => {
    setIsSubmitting(true);
    try {
      const payload = {
        id: eventId
      };
      
      console.log('Deleting event with payload:', payload);
      
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/agenda/excluir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      toast.success("Evento excluído com sucesso!");
      await fetchEvents(); // Refresh events
      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error("Erro ao excluir evento. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return { 
    events, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshEvents: fetchEvents,
    addEvent,
    editEvent,
    deleteEvent,
    isSubmitting
  };
}

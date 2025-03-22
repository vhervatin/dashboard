import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Clock, Edit, Filter, Search, Trash2, Users, ArrowLeft, Check, X, AlertCircle, Link as LinkIcon, Mail, RefreshCw, LoaderCircle, Plus } from 'lucide-react';
import { format, isSameDay, parseISO, addDays, addHours, addMinutes } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useCalendarEvents, EventFormData, CalendarEvent } from '@/hooks/useCalendarEvents';
import { EventFormDialog } from '@/components/EventFormDialog';
import { DeleteEventDialog } from '@/components/DeleteEventDialog';

// Tipos para os agendamentos e formulários
type Appointment = {
  id: number;
  petName: string;
  ownerName: string;
  phone: string;
  date: Date;
  service: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
  notes: string;
};
type FormData = Omit<Appointment, 'id'>;

// Dados mock para os agendamentos
const mockAppointments: Appointment[] = [
  {
    id: 1,
    petName: 'Max',
    ownerName: 'João Silva',
    phone: '(11) 98765-4321',
    date: new Date(2023, 5, 15, 10, 30),
    service: 'Banho e Tosa',
    status: 'confirmado',
    notes: 'Trazer a coleira nova'
  },
  {
    id: 2,
    petName: 'Luna',
    ownerName: 'Maria Oliveira',
    phone: '(11) 91234-5678',
    date: new Date(2023, 5, 15, 14, 0),
    service: 'Consulta Veterinária',
    status: 'pendente',
    notes: 'Verificar vacinas'
  },
  {
    id: 3,
    petName: 'Toby',
    ownerName: 'Pedro Santos',
    phone: '(11) 99876-5432',
    date: new Date(2023, 5, 16, 9, 0),
    service: 'Exames de Rotina',
    status: 'confirmado',
    notes: ''
  },
  {
    id: 4,
    petName: 'Bella',
    ownerName: 'Ana Costa',
    phone: '(11) 98765-1234',
    date: addDays(new Date(), 1),
    service: 'Banho e Tosa',
    status: 'confirmado',
    notes: 'Pet alérgico a certos produtos'
  },
  {
    id: 5,
    petName: 'Thor',
    ownerName: 'Lucas Ferreira',
    phone: '(11) 97654-3210',
    date: addDays(new Date(), 1),
    service: 'Consulta Veterinária',
    status: 'pendente',
    notes: ''
  },
  {
    id: 6,
    petName: 'Nina',
    ownerName: 'Carla Souza',
    phone: '(11) 98888-7777',
    date: addHours(new Date(), 3),
    service: 'Banho',
    status: 'confirmado',
    notes: 'Chegará 15 minutos antes'
  },
  {
    id: 7,
    petName: 'Rex',
    ownerName: 'Roberto Almeida',
    phone: '(11) 99999-8888',
    date: addMinutes(new Date(), 90),
    service: 'Vacinação',
    status: 'confirmado',
    notes: ''
  }
];

const Schedule = () => {
  const {
    user,
    isLoading: isAuthLoading
  } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const {
    events,
    isLoading: isEventsLoading,
    error: eventsError,
    lastUpdated,
    refreshEvents,
    addEvent,
    editEvent,
    deleteEvent,
    isSubmitting
  } = useCalendarEvents(selectedDate);
  
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<FormData>({
    petName: '',
    ownerName: '',
    phone: '',
    date: new Date(),
    service: 'Banho e Tosa',
    status: 'pendente',
    notes: ''
  });
  
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [isDeleteEventDialogOpen, setIsDeleteEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('day');
  
  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/');
    }
  }, [user, isAuthLoading, navigate]);
  
  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-petshop-gold rounded-full animate-spin"></div>
      </div>;
  }
  
  const filteredAppointments = appointments.filter(appointment => {
    if (selectedTab === 'day' && selectedDate) {
      return isSameDay(appointment.date, selectedDate);
    } else if (selectedTab === 'all') {
      return true;
    }
    return false;
  }).filter(appointment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return appointment.petName.toLowerCase().includes(searchLower) || appointment.ownerName.toLowerCase().includes(searchLower) || appointment.phone.includes(searchTerm) || appointment.service.toLowerCase().includes(searchLower);
  }).sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const filteredEvents = events.filter(event => {
    if (selectedTab === 'day' && selectedDate) {
      const eventStartDate = parseISO(event.start);
      return isSameDay(eventStartDate, selectedDate);
    } else if (selectedTab === 'all') {
      return true;
    }
    return false;
  }).filter(event => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return event.summary && event.summary.toLowerCase().includes(searchLower) || 
           event.description && event.description.toLowerCase().includes(searchLower) ||
           event.attendees && event.attendees.some(attendee => attendee?.email && attendee.email.toLowerCase().includes(searchLower));
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditDialogOpen && currentAppointment) {
      setAppointments(appointments.map(app => app.id === currentAppointment.id ? {
        ...formData,
        id: app.id
      } : app));
      setIsEditDialogOpen(false);
    } else {
      const newId = Math.max(0, ...appointments.map(a => a.id)) + 1;
      setAppointments([...appointments, {
        ...formData,
        id: newId
      }]);
      setIsAddDialogOpen(false);
    }
    setFormData({
      petName: '',
      ownerName: '',
      phone: '',
      date: new Date(),
      service: 'Banho e Tosa',
      status: 'pendente',
      notes: ''
    });
  };
  
  const handleEditClick = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setFormData({
      petName: appointment.petName,
      ownerName: appointment.ownerName,
      phone: appointment.phone,
      date: appointment.date,
      service: appointment.service,
      status: appointment.status,
      notes: appointment.notes
    });
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteClick = (appointment: Appointment) => {
    setCurrentAppointment(appointment);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (currentAppointment) {
      setAppointments(appointments.filter(app => app.id !== currentAppointment.id));
      setIsDeleteDialogOpen(false);
      setCurrentAppointment(null);
    }
  };
  
  const handleAddEvent = (formData: EventFormData) => {
    addEvent(formData).then(success => {
      if (success) {
        setIsAddEventDialogOpen(false);
      }
    });
  };
  
  const handleEditEvent = (formData: EventFormData) => {
    if (selectedEvent) {
      editEvent(selectedEvent.id, formData).then(success => {
        if (success) {
          setIsEditEventDialogOpen(false);
          setSelectedEvent(null);
        }
      });
    }
  };
  
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id).then(success => {
        if (success) {
          setIsDeleteEventDialogOpen(false);
          setSelectedEvent(null);
        }
      });
    }
  };
  
  const openEditEventDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditEventDialogOpen(true);
  };
  
  const openDeleteEventDialog = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDeleteEventDialogOpen(true);
  };
  
  const getStatusColor = (status: string, responseStatus?: string) => {
    if (responseStatus) {
      switch (responseStatus) {
        case 'accepted':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'tentative':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'declined':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        case 'needsAction':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      }
    }
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'tentative':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'confirmado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };
  
  const getResponseStatusLabel = (responseStatus?: string) => {
    switch (responseStatus) {
      case 'accepted':
        return 'Confirmado';
      case 'tentative':
        return 'Provisório';
      case 'declined':
        return 'Recusado';
      case 'needsAction':
        return 'Pendente';
      default:
        return 'Indefinido';
    }
  };
  
  const openEventLink = (url: string) => {
    window.open(url, '_blank');
  };
  
  return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              Agenda de Atendimentos
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refreshEvents} className="flex items-center gap-2" disabled={isEventsLoading}>
              {isEventsLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Atualizar
            </Button>
            {lastUpdated && <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:inline-block">
                Última atualização: {format(lastUpdated, "dd/MM/yyyy HH:mm:ss")}
              </span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Calendário</CardTitle>
                <CardDescription>Selecione uma data</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="border rounded-md" locale={pt} />
              </CardContent>
              <CardFooter className="flex flex-col items-center gap-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", {
                  locale: pt
                })}
                </p>
                <Button 
                  onClick={() => setIsAddEventDialogOpen(true)} 
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Evento
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-9">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Agenda PetShop Pet Paradise</CardTitle>
                    <CardDescription>
                      {selectedTab === 'day' ? `Visualizando ${filteredEvents.length} eventos para ${selectedDate ? format(selectedDate, "dd/MM/yyyy", {
                      locale: pt
                    }) : 'hoje'}` : `Visualizando todos os ${filteredEvents.length} eventos`}
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <Input type="search" placeholder="Buscar eventos..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    
                    <Tabs defaultValue="day" className="w-full sm:w-auto" onValueChange={setSelectedTab}>
                      <TabsList>
                        <TabsTrigger value="day">Diário</TabsTrigger>
                        <TabsTrigger value="all">Todos</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {eventsError && events.length === 0 && <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Não conseguimos atualizar os eventos, tentando novamente em breve...
                    </AlertDescription>
                  </Alert>}

                {isEventsLoading && events.length === 0 ? <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div> : <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Horário</TableHead>
                          <TableHead>Serviço</TableHead>
                          <TableHead>Participante</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEvents.length > 0 ? filteredEvents.map(event => {
                      const startDate = parseISO(event.start);
                      const endDate = parseISO(event.end);
                      const attendee = event.attendees?.find(a => a !== null);
                      return <TableRow key={event.id}>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    {format(startDate, 'HH:mm')}
                                    {!isSameDay(startDate, endDate) && ' - evento de múltiplos dias'}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {format(startDate, "dd/MM/yyyy")}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{event.summary}</TableCell>
                                <TableCell>
                                  {attendee?.email ? <div className="flex items-center gap-1">
                                      <Mail className="h-4 w-4 text-gray-500" />
                                      {attendee.email}
                                    </div> : <span className="text-gray-500">Sem participante</span>}
                                </TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status, attendee?.responseStatus)}`}>
                                    {getResponseStatusLabel(attendee?.responseStatus)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => openEditEventDialog(event)} 
                                      title="Editar evento"
                                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => openDeleteEventDialog(event)} 
                                      title="Excluir evento"
                                      className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => openEventLink(event.htmlLink)} 
                                      title="Abrir no Google Calendar"
                                    >
                                      <LinkIcon className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>;
                    }) : <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                              {isEventsLoading ? <div className="flex justify-center items-center gap-2">
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                  <span>Carregando eventos...</span>
                                </div> : "Nenhum evento encontrado para esta data ou pesquisa."}
                            </TableCell>
                          </TableRow>}
                      </TableBody>
                    </Table>
                  </div>}
              </CardContent>
              {lastUpdated && <CardFooter>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Última atualização: {format(lastUpdated, "dd/MM/yyyy HH:mm:ss")}
                  </p>
                </CardFooter>}
            </Card>
          </div>
        </div>
      </div>

      <EventFormDialog
        open={isAddEventDialogOpen}
        onOpenChange={setIsAddEventDialogOpen}
        onSubmit={handleAddEvent}
        isSubmitting={isSubmitting}
        title="Adicionar Evento"
        description="Preencha os campos para adicionar um novo evento ao calendário."
        submitLabel="Salvar Evento"
      />

      <EventFormDialog
        open={isEditEventDialogOpen}
        onOpenChange={setIsEditEventDialogOpen}
        onSubmit={handleEditEvent}
        isSubmitting={isSubmitting}
        event={selectedEvent || undefined}
        title="Editar Evento"
        description="Modifique os campos para atualizar este evento."
        submitLabel="Salvar Alterações"
      />

      <DeleteEventDialog
        open={isDeleteEventDialogOpen}
        onOpenChange={setIsDeleteEventDialogOpen}
        onConfirmDelete={handleDeleteEvent}
        event={selectedEvent}
        isDeleting={isSubmitting}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Preencha os dados para criar um novo agendamento.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petName">Nome do Pet</Label>
                <Input id="petName" value={formData.petName} onChange={e => setFormData({
                ...formData,
                petName: e.target.value
              })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ownerName">Nome do Proprietário</Label>
                <Input id="ownerName" value={formData.ownerName} onChange={e => setFormData({
                ...formData,
                ownerName: e.target.value
              })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={formData.phone} onChange={e => setFormData({
                ...formData,
                phone: e.target.value
              })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Data e Hora</Label>
                <div className="flex">
                  <Input id="date" type="datetime-local" value={format(formData.date, "yyyy-MM-dd'T'HH:mm")} onChange={e => {
                  const newDate = e.target.value ? new Date(e.target.value) : new Date();
                  setFormData({
                    ...formData,
                    date: newDate
                  });
                }} required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service">Serviço</Label>
                <select id="service" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" value={formData.service} onChange={e => setFormData({
                ...formData,
                service: e.target.value
              })} required>
                  <option value="Banho e Tosa">Banho e Tosa</option>
                  <option value="Banho">Banho</option>
                  <option value="Tosa">Tosa</option>
                  <option value="Consulta Veterinária">Consulta Veterinária</option>
                  <option value="Vacinação">Vacinação</option>
                  <option value="Exames de Rotina">Exames de Rotina</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select id="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" value={formData.status} onChange={e => setFormData({
                ...formData,
                status: e.target.value as 'confirmado' | 'pendente' | 'cancelado'
              })} required>
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input id="notes" value={formData.notes} onChange={e => setFormData({
              ...formData,
              notes: e.target.value
            })} />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Agendamento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
            <DialogDescription>
              Atualize os dados do agendamento.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-petName">Nome do Pet</Label>
                <Input id="edit-petName" value={formData.petName} onChange={e => setFormData({
                ...formData,
                petName: e.target.value
              })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-ownerName">Nome do Proprietário</Label>
                <Input id="edit-ownerName" value={formData.ownerName} onChange={e => setFormData({
                ...formData,
                ownerName: e.target.value
              })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input id="edit-phone" value={formData.phone} onChange={e => setFormData({
                ...formData,
                phone: e.target.value
              })} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-date">Data e Hora</Label>
                <div className="flex">
                  <Input id="edit-date" type="datetime-local" value={format(formData.date, "yyyy-MM-dd'T'HH:mm")} onChange={e => {
                  const newDate = e.target.value ? new Date(e.target.value) : new Date();
                  setFormData({
                    ...formData,
                    date: newDate
                  });
                }} required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-service">Serviço</Label>
                <select id="edit-service" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" value={formData.service} onChange={e => setFormData({
                ...formData,
                service: e.target.value
              })} required>
                  <option value="Banho e Tosa">Banho e Tosa</option>
                  <option value="Banho">Banho</option>
                  <option value="Tosa">Tosa</option>
                  <option value="Consulta Veterinária">Consulta Veterinária</option>
                  <option value="Vacinação">Vacinação</option>
                  <option value="Exames de Rotina">Exames de Rotina</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select id="edit-status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" value={formData.status} onChange={e => setFormData({
                ...formData,
                status: e.target.value as 'confirmado' | 'pendente' | 'cancelado'
              })} required>
                  <option value="pendente">Pendente</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Input id="edit-notes" value={formData.notes} onChange={e => setFormData({
              ...formData,
              notes: e.target.value
            })} />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Atualizar Agendamento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {currentAppointment && <div className="py-4">
              <p><strong>Pet:</strong> {currentAppointment.petName}</p>
              <p><strong>Proprietário:</strong> {currentAppointment.ownerName}</p>
              <p><strong>Data/Hora:</strong> {format(currentAppointment.date, "dd/MM/yyyy 'às' HH:mm", {
              locale: pt
            })}</p>
              <p><strong>Serviço:</strong> {currentAppointment.service}</p>
            </div>}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};

export default Schedule;

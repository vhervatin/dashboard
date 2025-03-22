import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search, Filter, UserPlus, ChevronDown, Edit2, Trash2, Users, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const MOCK_CONTACTS = [
  { 
    id: '1', 
    name: 'João Silva', 
    email: 'joao.silva@email.com', 
    phone: '(11) 99999-8888', 
    address: 'Rua das Flores, 123 - São Paulo, SP',
    petName: 'Rex',
    status: 'Active',
    notes: 'Cliente desde 2020, interessado em novos serviços de banho e tosa.',
    lastContact: '2023-10-15'
  },
  { 
    id: '2', 
    name: 'Maria Oliveira', 
    email: 'maria.oliveira@email.com', 
    phone: '(21) 98888-7777', 
    address: 'Av. Atlântica, 456 - Rio de Janeiro, RJ',
    petName: 'Luna',
    status: 'Inactive',
    notes: 'Possui 3 cachorros e 2 gatos. Prefere atendimento à domicílio.',
    lastContact: '2023-09-22'
  },
  { 
    id: '3', 
    name: 'Carlos Pereira', 
    email: 'carlos.pereira@email.com', 
    phone: '(31) 97777-6666', 
    address: 'Praça da Liberdade, 789 - Belo Horizonte, MG',
    petName: 'Toby',
    status: 'Active',
    notes: 'Cliente VIP, sempre compra produtos premium para seu Shih-tzu.',
    lastContact: '2023-10-05'
  },
  { 
    id: '4', 
    name: 'Ana Santos', 
    email: 'ana.santos@email.com', 
    phone: '(41) 96666-5555', 
    address: 'Rua XV de Novembro, 1011 - Curitiba, PR',
    petName: 'Mia',
    status: 'Active',
    notes: 'Veterinária, possui contatos no setor. Boa para parcerias.',
    lastContact: '2023-10-18'
  },
  { 
    id: '5', 
    name: 'Paulo Costa', 
    email: 'paulo.costa@email.com', 
    phone: '(51) 95555-4444', 
    address: 'Av. Ipiranga, 1213 - Porto Alegre, RS',
    petName: 'Thor',
    status: 'Inactive',
    notes: 'Dono de um Golden Retriever. Interessado em serviços de adestramento.',
    lastContact: '2023-08-30'
  },
];

type Contact = typeof MOCK_CONTACTS[0];

const ClientsDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    petName: '',
    status: 'Active',
    notes: '',
  });

  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-petshop-blue dark:bg-gray-900">
      <div className="h-16 w-16 border-4 border-t-transparent border-petshop-gold rounded-full animate-spin"></div>
    </div>;
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailSheetOpen(true);
  };

  const handleAddContact = async () => {
    const id = (contacts.length + 1).toString();
    const today = new Date().toISOString().split('T')[0];
    
    const contactWithDefaults: Contact = {
      id,
      lastContact: today,
      ...newContact as Omit<Contact, 'id' | 'lastContact'>
    };
    
    try {
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/cadastra_usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactWithDefaults),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar dados para o webhook');
      }
      
      setContacts([...contacts, contactWithDefaults]);
      setNewContact({
        name: '',
        email: '',
        phone: '',
        address: '',
        petName: '',
        status: 'Active',
        notes: '',
      });
      setIsAddContactOpen(false);
      
      toast({
        title: "Cliente adicionado",
        description: `${contactWithDefaults.name} foi adicionado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      toast({
        title: "Erro ao adicionar cliente",
        description: "Não foi possível enviar os dados para o servidor.",
        variant: "destructive",
      });
    }
  };

  const handleEditContact = async () => {
    if (!selectedContact) return;
    
    try {
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/edita_usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedContact.id,
          ...newContact
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar dados para o webhook');
      }
      
      const updatedContacts = contacts.map(c => 
        c.id === selectedContact.id ? { ...c, ...newContact } : c
      );
      
      setContacts(updatedContacts);
      setSelectedContact({ ...selectedContact, ...newContact });
      setIsEditModalOpen(false);
      
      toast({
        title: "Cliente atualizado",
        description: `As informações de ${selectedContact.name} foram atualizadas.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Não foi possível enviar os dados para o servidor.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    
    try {
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/exclui_usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: selectedContact.phone }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar dados para o webhook');
      }
      
      const filteredContacts = contacts.filter(c => c.id !== selectedContact.id);
      setContacts(filteredContacts);
      setSelectedContact(null);
      setIsDetailSheetOpen(false);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Cliente removido",
        description: `${selectedContact.name} foi removido da sua lista de clientes.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast({
        title: "Erro ao remover cliente",
        description: "Não foi possível enviar os dados para o servidor.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditModal = () => {
    if (!selectedContact) return;
    setNewContact({
      name: selectedContact.name,
      email: selectedContact.email,
      phone: selectedContact.phone,
      address: selectedContact.address,
      petName: selectedContact.petName,
      status: selectedContact.status,
      notes: selectedContact.notes,
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-petshop-blue dark:bg-gray-800 text-white shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">CRM de Clientes</h1>
          <div className="flex items-center gap-4">
            <Button variant="default" onClick={() => navigate('/dashboard')} className="bg-petshop-gold hover:bg-amber-500 text-petshop-blue">
              Voltar para Dashboard
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Card className="border dark:border-gray-700 shadow-sm">
          <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Gerenciamento de Clientes</CardTitle>
                <CardDescription>Visualize, adicione e edite seus clientes</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input 
                    placeholder="Pesquisar clientes..." 
                    className="pl-10 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Novo Cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                      <DialogDescription>
                        Preencha as informações para adicionar um novo cliente ao seu CRM.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nome
                        </Label>
                        <Input
                          id="name"
                          value={newContact.name}
                          onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                          Telefone
                        </Label>
                        <Input
                          id="phone"
                          value={newContact.phone}
                          onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="petName" className="text-right">
                          Nome do Pet
                        </Label>
                        <Input
                          id="petName"
                          value={newContact.petName}
                          onChange={(e) => setNewContact({...newContact, petName: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">
                          Endereço
                        </Label>
                        <Input
                          id="address"
                          value={newContact.address}
                          onChange={(e) => setNewContact({...newContact, address: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">
                          Observações
                        </Label>
                        <Textarea
                          id="notes"
                          value={newContact.notes}
                          onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleAddContact}>Adicionar Cliente</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Nome do Pet</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Contato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <TableRow 
                        key={contact.id} 
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => handleContactClick(contact)}
                      >
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.phone}</TableCell>
                        <TableCell>{contact.petName}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            contact.status === 'Active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {contact.status}
                          </span>
                        </TableCell>
                        <TableCell>{contact.lastContact}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {searchTerm 
                          ? 'Nenhum cliente encontrado com esse termo de busca.' 
                          : 'Nenhum cliente disponível. Adicione seu primeiro cliente!'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="border-t dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total de clientes: {filteredContacts.length}
            </div>
          </CardFooter>
        </Card>
      </main>

      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedContact && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-petshop-blue dark:text-petshop-gold" />
                  {selectedContact.name}
                </SheetTitle>
                <SheetDescription>
                  Detalhes do cliente e seu pet
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Informações Básicas
                  </h3>
                  <div className="grid grid-cols-[20px_1fr] gap-x-3 gap-y-4 items-start">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{selectedContact.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    </div>
                    
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{selectedContact.phone}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Telefone</p>
                    </div>
                    
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{selectedContact.petName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nome do Pet</p>
                    </div>
                    
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{selectedContact.address}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Endereço</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Observações
                  </h3>
                  <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-3">
                    <p className="text-sm">{selectedContact.notes}</p>
                  </div>
                </div>
                
                <div className="pt-4 flex gap-3 justify-end border-t dark:border-gray-700">
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmar exclusão</DialogTitle>
                        <DialogDescription>
                          Tem certeza que deseja excluir o cliente {selectedContact.name}? 
                          Esta ação não pode ser desfeita.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDeleteContact}>Confirmar Exclusão</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={openEditModal}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                        <DialogDescription>
                          Atualize as informações de {selectedContact.name}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-name" className="text-right">
                            Nome
                          </Label>
                          <Input
                            id="edit-name"
                            value={newContact.name}
                            onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={newContact.email}
                            onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-phone" className="text-right">
                            Telefone
                          </Label>
                          <Input
                            id="edit-phone"
                            value={newContact.phone}
                            onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-petName" className="text-right">
                            Nome do Pet
                          </Label>
                          <Input
                            id="edit-petName"
                            value={newContact.petName}
                            onChange={(e) => setNewContact({...newContact, petName: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-address" className="text-right">
                            Endereço
                          </Label>
                          <Input
                            id="edit-address"
                            value={newContact.address}
                            onChange={(e) => setNewContact({...newContact, address: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-notes" className="text-right">
                            Observações
                          </Label>
                          <Textarea
                            id="edit-notes"
                            value={newContact.notes}
                            onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleEditContact}>Salvar Alterações</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="default" size="sm">
                    <Phone className="mr-2 h-4 w-4" />
                    Ligar
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ClientsDashboard;

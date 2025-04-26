import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentCard } from '@/components/ui/ContentCard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ClientsHeader from '@/components/clients/ClientsHeader';
import ClientSearchBar from '@/components/clients/ClientSearchBar';
import ClientsTable from '@/components/clients/ClientsTable';
import AddClientDialog from '@/components/clients/AddClientDialog';
import EditClientDialog from '@/components/clients/EditClientDialog';
import ClientDetailSheet from '@/components/clients/ClientDetailSheet';
import { useClientManagement } from '@/hooks/useClientManagement';

const ClientsDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const {
    contacts,
    loadingContacts,
    refreshing,
    selectedContact,
    isAddContactOpen,
    setIsAddContactOpen,
    isDetailSheetOpen,
    setIsDetailSheetOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isMessageDialogOpen,
    setIsMessageDialogOpen,
    isPauseDurationDialogOpen,
    setIsPauseDurationDialogOpen,
    messageText,
    setMessageText,
    newContact,
    setNewContact,
    handleRefresh,
    handleContactClick,
    handleAddContact,
    handleEditContact,
    handleDeleteContact,
    openEditModal,
    handleMessageClick,
    handleMessageSubmit,
    handlePauseDurationConfirm
  } = useClientManagement();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petshop-blue dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-petshop-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-8">
        <PageHeader
          title="Clientes"
          description="Gerencie seus clientes e pets"
        />
        
        <ContentCard title="Lista de Clientes">
          <Card className="border dark:border-gray-700 shadow-sm">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Gerenciamento de Clientes</CardTitle>
                  <CardDescription>Visualize, adicione e edite seus clientes</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <ClientSearchBar 
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    onRefresh={handleRefresh}
                    isRefreshing={refreshing}
                    isLoading={loadingContacts}
                  />
                  <AddClientDialog 
                    isOpen={isAddContactOpen}
                    onOpenChange={setIsAddContactOpen}
                    newContact={newContact}
                    setNewContact={setNewContact}
                    handleAddContact={handleAddContact}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ClientsTable 
                contacts={contacts}
                isLoading={loadingContacts}
                searchTerm={searchTerm}
                onContactClick={handleContactClick}
              />
            </CardContent>
            <CardFooter className="border-t dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total de clientes: {contacts.filter(contact =>
                  contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (contact.petName && contact.petName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (contact.phone && contact.phone.includes(searchTerm))
                ).length}
              </div>
            </CardFooter>
          </Card>
        </ContentCard>
      </div>

      <ClientDetailSheet 
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        selectedContact={selectedContact}
        onEditClick={openEditModal}
        onDeleteClick={() => setIsDeleteDialogOpen(true)}
        onSendMessageClick={handleMessageClick}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        handleDeleteContact={handleDeleteContact}
        isMessageDialogOpen={isMessageDialogOpen}
        setIsMessageDialogOpen={setIsMessageDialogOpen}
        messageText={messageText}
        setMessageText={setMessageText}
        handleMessageSubmit={handleMessageSubmit}
        isPauseDurationDialogOpen={isPauseDurationDialogOpen}
        setIsPauseDurationDialogOpen={setIsPauseDurationDialogOpen}
        handlePauseDurationConfirm={handlePauseDurationConfirm}
      />
      
      <EditClientDialog 
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        selectedContact={selectedContact}
        editContactData={newContact}
        setEditContactData={setNewContact}
        handleEditContact={handleEditContact}
      />
    </PageLayout>
  );
};

export default ClientsDashboard;

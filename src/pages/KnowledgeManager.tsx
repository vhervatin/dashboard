import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { PawPrint, LogOut, ArrowLeft, Plus, Trash2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentCard } from '@/components/ui/ContentCard';
import { KnowledgeCard } from '@/components/knowledge/KnowledgeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import refactored components
import SearchBar from '@/components/knowledge/SearchBar';
import DocumentGrid from '@/components/knowledge/DocumentGrid';
import AddDocumentDialog from '@/components/knowledge/AddDocumentDialog';
import { useDocuments } from '@/hooks/useDocuments';

interface Category {
  id: string;
  name: string;
  description: string;
}

const KnowledgeManager = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('articles');
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Geral', description: 'Documentos gerais' },
    { id: '2', name: 'Tutoriais', description: 'Guias e tutoriais' },
    { id: '3', name: 'Processos', description: 'Documentação de processos' }
  ]);
  
  // Use the custom hook for document management
  const { 
    documents, 
    isLoading, 
    isRefreshing, 
    handleRefresh, 
    handleDeleteDocument,
    uploadFileToWebhook,
    clearAllDocuments
  } = useDocuments();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Handle adding a new document
  const handleAddDocument = async (file: File, category: string) => {
    try {
      await uploadFileToWebhook(file, category);
      toast({
        title: "Documento adicionado",
        description: "O documento foi adicionado com sucesso à base de conhecimento.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar documento",
        description: "Ocorreu um erro ao tentar adicionar o documento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Handle document deletion with confirmation
  const handleDelete = async (id: number, title: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await handleDeleteDocument(id, title);
        toast({
          title: "Documento excluído",
          description: "O documento foi removido com sucesso da base de conhecimento.",
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Erro ao excluir documento",
          description: "Ocorreu um erro ao tentar excluir o documento. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading || authLoading) {
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
          title="Base de Conhecimento"
          description="Gerencie artigos e informações da sua base de conhecimento"
        />
        
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRefresh={handleRefresh}
              onAddDocument={() => setIsAddDocumentOpen(true)}
              onClearAll={clearAllDocuments}
              isRefreshing={isRefreshing}
            />
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsAddDocumentOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Documento
              </Button>
            </div>
          </div>

          <Tabs defaultValue="articles" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="articles">Artigos</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
            </TabsList>
            <TabsContent value="articles">
              <ContentCard title="Artigos">
                <DocumentGrid 
                  documents={documents}
                  searchQuery={searchQuery}
                  onDeleteDocument={handleDelete}
                />
              </ContentCard>
            </TabsContent>
            <TabsContent value="categories">
              <ContentCard title="Categorias">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories?.map((category) => (
                    <div key={category.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <Badge variant="secondary">
                          {documents.filter(doc => doc.category === category.name).length} documentos
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{category.description}</p>
                    </div>
                  ))}
                </div>
              </ContentCard>
            </TabsContent>
          </Tabs>
        </div>

        <AddDocumentDialog 
          isOpen={isAddDocumentOpen}
          onOpenChange={setIsAddDocumentOpen}
          onAddDocument={handleAddDocument}
        />
      </div>
    </PageLayout>
  );
};

export default KnowledgeManager;

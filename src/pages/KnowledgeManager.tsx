import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Database,
  PawPrint,
  LogOut,
  FileText,
  Trash2,
  Plus,
  Search,
  ArrowLeft,
  Upload,
  FileUp,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Document type definition
interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  category: string;
  content?: string | null;
  metadata?: Record<string, any>;
}

const KnowledgeManager = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Fetch documents from Supabase
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*');

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Erro ao carregar documentos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Transform the data to match our Document interface
      const formattedDocs: Document[] = data.map(doc => {
        // Extract file info from metadata
        const metadata = doc.metadata || {};
        const fileInfo = {
          name: typeof metadata === 'object' && metadata.filename ? metadata.filename : `Documento ${doc.id}`,
          type: typeof metadata === 'object' && metadata.filetype ? metadata.filetype : 'unknown',
          size: typeof metadata === 'object' && metadata.filesize ? metadata.filesize : 'Unknown',
          category: typeof metadata === 'object' && metadata.category ? metadata.category : 'Sem categoria',
          uploadedAt: new Date(
            typeof metadata === 'object' && metadata.uploadedAt ? metadata.uploadedAt : Date.now()
          ).toISOString().split('T')[0],
        };

        return {
          id: doc.id,
          name: fileInfo.name,
          type: fileInfo.type,
          size: fileInfo.size,
          uploadedAt: fileInfo.uploadedAt,
          category: fileInfo.category,
          content: doc.content,
          metadata: doc.metadata
        };
      });

      setDocuments(formattedDocs);
    } catch (err) {
      console.error('Unexpected error fetching documents:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os documentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDocuments();
    toast({
      title: "Atualizando documentos",
      description: "Os documentos estão sendo atualizados do banco de dados.",
    });
  };

  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Upload file to webhook
  const uploadFileToWebhook = async (file: File, category: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/envia_rag', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar o arquivo: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Arquivo enviado com sucesso:', result);
      return true;
    } catch (error) {
      console.error('Erro ao enviar o arquivo:', error);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  // Add new document
  const handleAddDocument = async () => {
    if (selectedFile && fileCategory) {
      // Upload to webhook first
      const uploadSuccess = await uploadFileToWebhook(selectedFile, fileCategory);
      
      if (uploadSuccess) {
        // After successful upload, refresh the document list to get the newly added document
        await fetchDocuments();
        
        setSelectedFile(null);
        setFileCategory('');
        setIsAddDocumentOpen(false);

        toast({
          title: "Documento adicionado",
          description: `${selectedFile.name} foi adicionado com sucesso!`,
        });
      } else {
        toast({
          title: "Erro ao enviar documento",
          description: "Não foi possível enviar o documento para o sistema de conhecimento.",
          variant: "destructive",
        });
      }
    }
  };

  // Delete document
  const handleDeleteDocument = async (id: number) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting document:', error);
        toast({
          title: "Erro ao excluir documento",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setDocuments(documents.filter(doc => doc.id !== id));
      setSelectedDocument(null);
      
      toast({
        title: "Documento excluído",
        description: "O documento foi removido com sucesso!",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Unexpected error deleting document:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível excluir o documento.",
        variant: "destructive",
      });
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-petshop-blue dark:bg-gray-800 text-white shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PawPrint className="h-8 w-8 text-petshop-gold" />
            <h1 className="text-2xl font-bold">Pet Paradise</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              Bem-vindo, {user?.user_metadata?.name || user?.email}
            </Badge>
            <ThemeToggle />
            <Button variant="outline" onClick={signOut} className="border-white text-white bg-gray-950/50 hover:bg-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToDashboard}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Gerenciador de Conhecimento
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Buscar documentos..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="refresh" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              
              <Dialog open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Documento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Documento</DialogTitle>
                    <DialogDescription>
                      Selecione um arquivo do seu computador para adicionar à base de conhecimento.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center cursor-pointer"
                      >
                        <FileUp className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Clique para selecionar ou arraste o arquivo aqui
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
                        </p>
                      </label>
                    </div>
                    
                    {selectedFile && (
                      <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertTitle>Arquivo selecionado</AlertTitle>
                        <AlertDescription>
                          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium mb-1">
                        Categoria
                      </label>
                      <Input
                        id="category"
                        placeholder="ex: Procedimentos, Financeiro, Saúde..."
                        value={fileCategory}
                        onChange={(e) => setFileCategory(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddDocumentOpen(false)}
                      disabled={isUploading}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleAddDocument}
                      disabled={!selectedFile || !fileCategory || isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Fazer Upload
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-amber-500" />
                      <span className="truncate">{doc.name}</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {doc.category}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <div>Tipo: {doc.type.toUpperCase()}</div>
                      <div>Tamanho: {doc.size}</div>
                      <div>Adicionado: {doc.uploadedAt}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setSelectedDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Excluir Documento</DialogTitle>
                          <DialogDescription>
                            Esta ação não pode ser desfeita. Tem certeza que deseja excluir o documento?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancelar</Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => selectedDocument !== null && handleDeleteDocument(selectedDocument)}
                          >
                            Excluir
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <Database className="h-16 w-16 mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-1">Nenhum documento encontrado</h3>
                <p className="text-sm">
                  {searchQuery ? 
                    "Nenhum documento corresponde à sua pesquisa." : 
                    "Comece adicionando documentos à sua base de conhecimento."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default KnowledgeManager;

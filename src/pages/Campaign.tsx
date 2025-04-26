import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { useWebhookUrls } from '@/hooks/useWebhookUrls';
import { supabase } from '@/integrations/supabase/client';

interface Campaign {
  id: number;
  nome: string;
  mensagem: string;
  telefones: string[];
  delay: number;
  dataCriacao: string;
  nomeInstancia: string;
}

const CampaignPage = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [telefones, setTelefones] = useState('');
  const [delay, setDelay] = useState(3);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [nomeInstancia, setNomeInstancia] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { urls } = useWebhookUrls();

  // Utilitário para extrair números válidos de texto
  const extractPhones = (text: string): string[] => {
    return text
      .split(/\r?\n|,|;/)
      .map(t => t.trim())
      .filter(Boolean)
      .filter(t => /^\d{10,15}(@s.whatsapp.net)?$/.test(t));
  };

  // Leitura de CSV
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      toast({ title: 'Arquivo inválido', description: 'Envie um arquivo CSV.', variant: 'destructive' });
      return;
    }
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setTelefones(text);
    };
    reader.readAsText(file);
  };

  // Função para baixar modelo de CSV
  const handleDownloadCsvTemplate = () => {
    const csvContent = 'telefone\n11999999999\n11988888888\n11977777777';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo_telefones.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Abrir formulário
  const openForm = () => {
    setShowForm(true);
    setNome('');
    setMensagem('');
    setTelefones('');
    setDelay(3);
    setCsvFile(null);
    setNomeInstancia('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Fechar formulário
  const closeForm = () => {
    setShowForm(false);
  };

  // Buscar campanhas do Supabase ao carregar a página
  const fetchCampaigns = async () => {
    const { data, error } = await supabase
      .from('campanhas_disparadas')
      .select('*')
      .order('data_envio', { ascending: false });
    if (!error && data) {
      setCampaigns(
        data.map((c) => ({
          id: c.id,
          nome: c.nome,
          nomeInstancia: c.instancia,
          dataCriacao: c.data_envio,
          telefones: Array(c.quantidade_numeros).fill(''), // placeholder, não salva os números
          delay: c.delay || 0 // se não existir, mostrar 0
        }))
      );
    }
  };

  React.useEffect(() => {
    fetchCampaigns();
  }, []);

  // Envio da campanha
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeInstancia.trim()) {
      toast({ title: 'Nome da Instância obrigatório', variant: 'destructive' });
      return;
    }
    if (!nome.trim()) {
      toast({ title: 'Nome da campanha obrigatório', variant: 'destructive' });
      return;
    }
    if (!mensagem.trim()) {
      toast({ title: 'Mensagem obrigatória', variant: 'destructive' });
      return;
    }
    if (mensagem.length > 1000) {
      toast({ title: 'Mensagem muito longa', description: 'Limite de 1000 caracteres.', variant: 'destructive' });
      return;
    }
    if (delay < 1) {
      toast({ title: 'Delay mínimo de 1 segundo', variant: 'destructive' });
      return;
    }
    let phones = extractPhones(telefones);
    if (phones.length === 0) {
      toast({ title: 'Insira pelo menos um telefone válido', variant: 'destructive' });
      return;
    }
    if (phones.length > 1000) {
      toast({ title: 'Limite de 1000 telefones por campanha', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        nomeInstancia,
        nomeCampanha: nome,
        mensagem,
        telefones: phones,
        delay,
        dataCriacao: new Date().toISOString()
      };
      const response = await fetch(urls.campaignSend, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Erro ao enviar campanha');
      // Salvar no Supabase
      await supabase.from('campanhas_disparadas').insert({
        nome: nome,
        instancia: nomeInstancia,
        data_envio: payload.dataCriacao,
        quantidade_numeros: phones.length,
        delay: delay
      });
      toast({ title: 'Campanha enviada com sucesso!' });
      fetchCampaigns();
      closeForm();
    } catch (err) {
      toast({ title: 'Erro ao enviar campanha', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Campanha</h1>
          {!showForm && (
            <Button onClick={openForm} className="bg-petshop-gold text-petshop-blue font-bold">Criar Nova Campanha</Button>
          )}
        </div>
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nova Campanha</CardTitle>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Voltar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSendCampaign}>
                <Input
                  placeholder="Nome da campanha"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                />
                <Input
                  placeholder="Nome da Instância da Evolution"
                  value={nomeInstancia}
                  onChange={e => setNomeInstancia(e.target.value)}
                  required
                />
                <Textarea
                  placeholder="Mensagem a ser enviada (máx. 1000 caracteres)"
                  value={mensagem}
                  onChange={e => setMensagem(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  required
                />
                <div>
                  <label className="block text-sm font-medium mb-1">Telefones</label>
                  <Textarea
                    placeholder="Insira números manualmente (um por linha, vírgula ou ponto e vírgula)"
                    value={telefones}
                    onChange={e => setTelefones(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="file"
                      accept=".csv"
                      ref={fileInputRef}
                      onChange={handleCsvUpload}
                      className="block"
                    />
                    <span className="text-xs text-muted-foreground">ou envie um arquivo CSV</span>
                    <Button type="button" size="sm" variant="outline" onClick={handleDownloadCsvTemplate}>
                      Baixar modelo CSV
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Delay entre disparos <span className='text-xs text-muted-foreground'>(em segundos)</span></label>
                  <Input
                    type="number"
                    min={1}
                    value={delay}
                    onChange={e => setDelay(Number(e.target.value))}
                    required
                    placeholder="Delay entre disparos (segundos)"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={closeForm}>Cancelar</Button>
                  <Button type="submit" disabled={isLoading} className="bg-petshop-gold text-petshop-blue font-bold">
                    {isLoading ? 'Enviando...' : 'Enviar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Campanhas Criadas</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma campanha cadastrada ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">Instância</th>
                      <th className="text-left">Nome</th>
                      <th className="text-left">Data Criação</th>
                      <th className="text-left">Qtd. Telefones</th>
                      <th className="text-left">Delay (s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(camp => (
                      <tr key={camp.id}>
                        <td>{camp.nomeInstancia}</td>
                        <td>{camp.nome}</td>
                        <td>{format(new Date(camp.dataCriacao), 'dd/MM/yyyy HH:mm')}</td>
                        <td>{camp.telefones.length}</td>
                        <td>{camp.delay}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CampaignPage; 
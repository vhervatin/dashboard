import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentCard } from '@/components/ui/ContentCard';
import { WebhookConfig } from '@/components/config/WebhookConfig';
import { useWebhookUrls } from '@/hooks/useWebhookUrls';

const AgentConfig = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

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
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações do sistema"
      />
      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <ContentCard title="Webhooks" description="Configure as URLs dos webhooks do sistema">
          <WebhookConfig />
        </ContentCard>
      </div>
    </PageLayout>
  );
};

export default AgentConfig;

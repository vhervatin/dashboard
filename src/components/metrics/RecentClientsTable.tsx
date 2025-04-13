
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  phone: string;
  pets: number;
  lastVisit: string;
}

interface RecentClientsTableProps {
  clients: Client[];
}

const RecentClientsTable: React.FC<RecentClientsTableProps> = ({ clients }) => {
  return (
    <Card className="dark:bg-gray-800 transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
          <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          Clientes Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Telefone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Pets</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Última Visita</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr 
                  key={client.id} 
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/20"
                >
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{client.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{client.phone}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">
                    <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/40">
                      {client.pets} {client.pets > 1 ? 'pets' : 'pet'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{client.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-center">
          <Button variant="outline" className="text-sm">
            Ver todos os clientes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentClientsTable;

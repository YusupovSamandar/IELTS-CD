import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Cloud,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Settings,
  XCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface DatabaseInfo {
  provider: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  url?: string;
  error?: string;
}

export function DatabaseDashboard() {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const fetchDatabaseInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/database/info');
      const data = await response.json();
      setDbInfo(data);
    } catch (error) {
      setDbInfo({
        provider: 'unknown',
        name: 'Unknown',
        description: 'Failed to fetch database information',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      const response = await fetch('/api/database/test');
      const data = await response.json();

      if (dbInfo) {
        setDbInfo({
          ...dbInfo,
          status: data.success ? 'connected' : 'error',
          error: data.success ? undefined : data.error
        });
      }
    } catch (error) {
      if (dbInfo) {
        setDbInfo({
          ...dbInfo,
          status: 'error',
          error:
            error instanceof Error ? error.message : 'Connection test failed'
        });
      }
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'local':
        return <HardDrive className="h-5 w-5" />;
      case 'supabase':
        return <Cloud className="h-5 w-5" />;
      case 'production':
        return <Server className="h-5 w-5" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'disconnected':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading database information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dbInfo) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load database information. Please check your
              configuration.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
        </CardTitle>
        <CardDescription>
          Current database provider and connection status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Information */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getProviderIcon(dbInfo.provider)}
            <div>
              <h3 className="font-semibold">{dbInfo.name}</h3>
              <p className="text-sm text-muted-foreground">
                {dbInfo.description}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(dbInfo.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(dbInfo.status)}
              {dbInfo.status.charAt(0).toUpperCase() + dbInfo.status.slice(1)}
            </div>
          </Badge>
        </div>

        <Separator />

        {/* Connection Details */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Connection Details
          </h4>

          <div className="bg-muted p-3 rounded-md">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <span className="font-medium">Provider:</span>{' '}
                <code className="bg-background px-1 py-0.5 rounded">
                  {dbInfo.provider}
                </code>
              </div>
              {dbInfo.url && (
                <div>
                  <span className="font-medium">Connection:</span>{' '}
                  <code className="bg-background px-1 py-0.5 rounded break-all">
                    {dbInfo.url.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {dbInfo.error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {dbInfo.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={testConnection}
            disabled={testing}
            size="sm"
            variant="outline"
          >
            {testing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>

          <Button onClick={fetchDatabaseInfo} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Quick Actions */}
        <Separator />

        <div className="space-y-3">
          <h4 className="font-medium">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('/api/database/studio', '_blank')}
            >
              Open Prisma Studio
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('http://localhost:5050', '_blank')}
            >
              Open PgAdmin
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

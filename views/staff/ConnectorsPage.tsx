
import React, { useState } from 'react';
import { BaseApiConfig, EndpointDefinition, WebhookDefinition } from '../../types';
import { mockBaseApis, mockEndpointDefinitions, mockWebhookDefinitions, mockWebhookEvents } from '../../lib/mockData';
import { PlusCircleIcon, PencilIcon, ServerStackIcon, GlobeAltIcon, CommandLineIcon, CodeBracketIcon } from '../../components/icons/Icon';
import BaseApiEditModal from '../../components/staff/BaseApiEditModal';
import EndpointEditModal from '../../components/staff/EndpointEditModal';
import WebhookEditModal from '../../components/staff/WebhookEditModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';


const ConnectorsPage: React.FC = () => {
    const [baseApis, setBaseApis] = useState<BaseApiConfig[]>(mockBaseApis);
    const [editingBaseApi, setEditingBaseApi] = useState<BaseApiConfig | null>(null);
    const [isBaseApiModalOpen, setIsBaseApiModalOpen] = useState(false);

    const [endpoints, setEndpoints] = useState<EndpointDefinition[]>(mockEndpointDefinitions);
    const [editingEndpoint, setEditingEndpoint] = useState<EndpointDefinition | null>(null);
    const [isEndpointModalOpen, setIsEndpointModalOpen] = useState(false);
    
    const [webhooks, setWebhooks] = useState<WebhookDefinition[]>(mockWebhookDefinitions);
    const [editingWebhook, setEditingWebhook] = useState<WebhookDefinition | null>(null);
    const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

    // --- Base API Handlers ---
    const handleAddBaseApi = () => { setEditingBaseApi(null); setIsBaseApiModalOpen(true); };
    const handleEditBaseApi = (api: BaseApiConfig) => { setEditingBaseApi(api); setIsBaseApiModalOpen(true); };
    const handleSaveBaseApi = (api: BaseApiConfig) => {
        if (editingBaseApi) {
            setBaseApis(prev => prev.map(a => a.id === api.id ? api : a));
        } else {
            setBaseApis(prev => [...prev, { ...api, id: `API${Date.now()}` }]);
        }
        setIsBaseApiModalOpen(false);
    };
    const handleDeleteBaseApi = (id: string) => { setBaseApis(prev => prev.filter(a => a.id !== id)); setIsBaseApiModalOpen(false); };

    // --- Endpoint Handlers ---
    const handleAddEndpoint = () => { setEditingEndpoint(null); setIsEndpointModalOpen(true); };
    const handleEditEndpoint = (endpoint: EndpointDefinition) => { setEditingEndpoint(endpoint); setIsEndpointModalOpen(true); };
    const handleSaveEndpoint = (endpoint: EndpointDefinition) => {
        if (editingEndpoint) {
            setEndpoints(prev => prev.map(e => e.id === endpoint.id ? endpoint : e));
        } else {
            setEndpoints(prev => [...prev, { ...endpoint, id: `EP${Date.now()}` }]);
        }
        setIsEndpointModalOpen(false);
    };
    const handleDeleteEndpoint = (id: string) => { setEndpoints(prev => prev.filter(e => e.id !== id)); setIsEndpointModalOpen(false); };
    
    // --- Webhook Handlers ---
    const handleAddWebhook = () => { setEditingWebhook(null); setIsWebhookModalOpen(true); };
    const handleEditWebhook = (webhook: WebhookDefinition) => { setEditingWebhook(webhook); setIsWebhookModalOpen(true); };
    const handleSaveWebhook = (webhook: WebhookDefinition) => {
        if (editingWebhook) {
            setWebhooks(prev => prev.map(w => w.id === webhook.id ? webhook : w));
        } else {
            setWebhooks(prev => [...prev, { ...webhook, id: `WH${Date.now()}` }]);
        }
        setIsWebhookModalOpen(false);
    };
    const handleDeleteWebhook = (id: string) => { setWebhooks(prev => prev.filter(w => w.id !== id)); setIsWebhookModalOpen(false); };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
                <ServerStackIcon className="w-8 h-8 text-primary" />
                <div>
                    <CardTitle>Base API Endpoint URLs</CardTitle>
                    <CardDescription>Define base URLs and credentials for external APIs.</CardDescription>
                </div>
            </div>
            <Button onClick={handleAddBaseApi}><PlusCircleIcon className="w-4 h-4 mr-2"/>Add Base API</Button>
        </CardHeader>
        <CardContent>
            <ul role="list" className="divide-y divide-border border-t">
                {baseApis.map(api => (
                    <li key={api.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50">
                        <div>
                            <p className="text-sm font-semibold text-foreground">{api.name}</p>
                            <p className="text-sm font-mono text-muted-foreground">{api.baseUrl}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">{api.authType}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleEditBaseApi(api)}><PencilIcon className="w-4 h-4"/></Button>
                        </div>
                    </li>
                ))}
            </ul>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
                <CommandLineIcon className="w-8 h-8 text-primary" />
                <div>
                    <CardTitle>Endpoints</CardTitle>
                    <CardDescription>Define specific data endpoints on top of your Base APIs.</CardDescription>
                </div>
            </div>
            <Button onClick={handleAddEndpoint}><PlusCircleIcon className="w-4 h-4 mr-2"/>Add Endpoint</Button>
        </CardHeader>
        <CardContent>
            <ul role="list" className="divide-y divide-border border-t">
                {endpoints.map(ep => {
                    const baseApi = baseApis.find(a => a.id === ep.baseApiId);
                    return (
                    <li key={ep.id} className="px-4 py-3 hover:bg-muted/50">
                         <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-foreground">{ep.name}</p>
                                <p className="text-sm font-mono text-muted-foreground">
                                    <span className="font-bold text-green-600 dark:text-green-400">{ep.method}</span> {baseApi?.name}{ep.path}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleEditEndpoint(ep)}><PencilIcon className="w-4 h-4"/></Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{ep.description}</p>
                    </li>
                )})}
            </ul>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
             <div className="flex items-center space-x-3">
                <GlobeAltIcon className="w-8 h-8 text-primary" />
                <div>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>Trigger external systems based on internal program events.</CardDescription>
                </div>
            </div>
            <Button onClick={handleAddWebhook}><PlusCircleIcon className="w-4 h-4 mr-2"/>Add Webhook</Button>
        </CardHeader>
        <CardContent>
            <ul role="list" className="divide-y divide-border border-t">
                {webhooks.map(wh => (
                    <li key={wh.id} className="px-4 py-3 hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-foreground">{wh.eventName}</p>
                                <p className="text-sm font-mono text-muted-foreground">{wh.targetUrl}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${wh.status === 'Active' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>{wh.status}</span>
                                <Button variant="ghost" size="icon" onClick={() => handleEditWebhook(wh)}><PencilIcon className="w-4 h-4" /></Button>
                            </div>
                        </div>
                         {wh.conditions && (
                            <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
                                <CodeBracketIcon className="w-4 h-4 flex-shrink-0" />
                                <p className="font-mono truncate" title={wh.conditions}>
                                    Condition: {wh.conditions}
                                </p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </CardContent>
      </Card>

      {isBaseApiModalOpen && <BaseApiEditModal isOpen={isBaseApiModalOpen} onClose={() => setIsBaseApiModalOpen(false)} onSave={handleSaveBaseApi} onDelete={handleDeleteBaseApi} api={editingBaseApi} />}
      {isEndpointModalOpen && <EndpointEditModal isOpen={isEndpointModalOpen} onClose={() => setIsEndpointModalOpen(false)} onSave={handleSaveEndpoint} onDelete={handleDeleteEndpoint} endpoint={editingEndpoint} baseApis={baseApis} />}
      {isWebhookModalOpen && <WebhookEditModal isOpen={isWebhookModalOpen} onClose={() => setIsWebhookModalOpen(false)} onSave={handleSaveWebhook} onDelete={handleDeleteWebhook} webhook={editingWebhook} events={mockWebhookEvents} />}
    </div>
  );
};

export default ConnectorsPage;

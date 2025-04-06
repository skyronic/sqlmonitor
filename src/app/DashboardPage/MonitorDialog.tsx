import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddMonitor, useEditMonitor, useListConnections } from "@/store/backend";
import { useState } from "react";

interface MonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: number | null;
  monitor?: {
    id: number;
    name: string;
    connection_id: number;
    cadence: 'hourly' | 'daily';
    query: string;
  };
}

export const MonitorDialog: React.FC<MonitorDialogProps> = ({ open, onOpenChange, categoryId, monitor }) => {
  const [name, setName] = useState(monitor?.name || '');
  const [connectionId, setConnectionId] = useState<number | null>(monitor?.connection_id || null);
  const [cadence, setCadence] = useState<'hourly' | 'daily'>(monitor?.cadence || 'hourly');
  const [query, setQuery] = useState(monitor?.query || '');

  const { data: connections } = useListConnections();
  const addMonitor = useAddMonitor();
  const editMonitor = useEditMonitor(monitor?.id || 0);

  const handleSubmit = () => {
    if (!name || !connectionId || !query) return;

    if (monitor) {
      editMonitor.mutate({
        name,
        connection_id: connectionId,
        cadence,
        query,
        category_id: categoryId,
      }, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      addMonitor.mutate({
        name,
        connection_id: connectionId,
        cadence,
        query,
        category_id: categoryId,
        enabled: true,
        starred: false,
      }, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{monitor ? 'Edit Monitor' : 'Add Monitor'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Monitor name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="connection">Connection</Label>
            <Select
              value={connectionId?.toString() || ''}
              onValueChange={(value) => setConnectionId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select connection" />
              </SelectTrigger>
              <SelectContent>
                {connections?.map((conn) => (
                  <SelectItem key={conn.id} value={conn.id.toString()}>
                    {conn.name} ({conn.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cadence">Cadence</Label>
            <Select
              value={cadence}
              onValueChange={(value) => setCadence(value as 'hourly' | 'daily')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="query">Query</Label>
            <Textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SQL query"
              className="font-mono"
              rows={5}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {monitor ? 'Save' : 'Add'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
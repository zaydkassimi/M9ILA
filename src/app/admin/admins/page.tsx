"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Shield, Settings } from "lucide-react";
import { toast } from "sonner";

interface Admin {
  id: string; email: string; name: string; role: string; createdAt: string;
  avatarUrl: string; canAccessSettings: boolean;
}

export default function AdminsPage() {
  const { data: session } = useSession();
  const isSuperadmin = (session?.user as any)?.role === "superadmin";
  const currentUserId = (session?.user as any)?.id;
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "admin", canAccessSettings: false });

  const fetchAdmins = useCallback(async () => {
    const res = await fetch("/api/admins");
    if (res.ok) setAdmins(await res.json());
  }, []);

  useEffect(() => { if (isSuperadmin) fetchAdmins(); }, [isSuperadmin, fetchAdmins]);

  const openCreate = () => { setEditing(null); setForm({ email: "", password: "", name: "", role: "admin", canAccessSettings: false }); setDialogOpen(true); };
  const openEdit = (a: Admin) => { setEditing(a); setForm({ email: a.email, password: "", name: a.name, role: a.role, canAccessSettings: a.canAccessSettings }); setDialogOpen(true); };

  const save = async () => {
    const payload: Record<string, unknown> = { ...form };
    if (editing && !payload.password) delete payload.password;
    const url = editing ? `/api/admins/${editing.id}` : "/api/admins";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { toast.success(editing ? "Administrateur modifié" : "Administrateur créé"); setDialogOpen(false); fetchAdmins(); }
    else { const data = await res.json(); toast.error(data.error || "Erreur"); }
  };

  const remove = async (id: string) => {
    if (id === currentUserId) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte");
      return;
    }
    if (!confirm("Supprimer cet administrateur ?")) return;
    const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Administrateur supprimé"); fetchAdmins(); }
    else { const data = await res.json(); toast.error(data.error || "Erreur"); }
  };

  const toggleSettingsAccess = async (admin: Admin) => {
    const newVal = !admin.canAccessSettings;
    setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, canAccessSettings: newVal } : a));
    try {
      await fetch(`/api/admins/${admin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canAccessSettings: newVal }),
      });
      toast.success(newVal ? "Accès paramètres activé" : "Accès paramètres retiré");
    } catch {
      fetchAdmins();
    }
  };

  if (!isSuperadmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="size-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold">Accès restreint</h2>
        <p className="text-muted-foreground">Seuls les super-administrateurs peuvent gérer les comptes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administrateurs</h1>
          <p className="text-muted-foreground">Gérez les comptes d&apos;administration</p>
        </div>
        <Button onClick={openCreate} className="bg-[#CC0000] hover:bg-[#AA0000]"><Plus className="mr-2 size-4" /> Nouvel admin</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Modifier" : "Nouvel administrateur"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Nom</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>{editing ? "Nouveau mot de passe (vide = inchangé)" : "Mot de passe"}</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={form.role} onValueChange={(v) => v && setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="superadmin">Super-administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Settings className="size-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Accès aux paramètres</Label>
                  <p className="text-xs text-muted-foreground">Permettre l&apos;accès à la page Paramètres</p>
                </div>
              </div>
              <Switch checked={form.canAccessSettings} onCheckedChange={(v: boolean) => setForm({ ...form, canAccessSettings: v })} />
            </div>
            <Button onClick={save} className="w-full bg-[#CC0000] hover:bg-[#AA0000]">{editing ? "Enregistrer" : "Créer"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Paramètres</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell><Badge variant={a.role === "superadmin" ? "default" : "secondary"}>{a.role === "superadmin" ? "Super-admin" : "Admin"}</Badge></TableCell>
                <TableCell>
                  <Switch
                    checked={a.canAccessSettings}
                    onCheckedChange={() => toggleSettingsAccess(a)}
                    disabled={a.role === "superadmin"}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(a.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="size-4" /></Button>
                    {a.id !== currentUserId && (
                      <Button variant="ghost" size="icon" onClick={() => remove(a.id)}><Trash2 className="size-4 text-destructive" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

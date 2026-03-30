"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string; name: string; email: string; phone: string;
  subject: string; message: string; isRead: boolean; createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);

  const fetchContacts = useCallback(async () => {
    const res = await fetch("/api/contacts");
    const data = await res.json();
    setContacts(data.contacts || []);
  }, []);

  useEffect(() => { fetchContacts(); }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/contacts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: true }) });
    fetchContacts();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    toast.success("Message supprimé");
    setSelected(null);
    fetchContacts();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Messages reçus via le formulaire de contact</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((c) => (
              <TableRow key={c.id} className={!c.isRead ? "bg-[#CC0000]/5 font-medium" : ""}>
                <TableCell>{!c.isRead && <Mail className="size-4 text-[#CC0000]" />}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.subject || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setSelected(c); markRead(c.id); }}><Eye className="size-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {contacts.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucun message</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Message de {selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>
                <div><span className="text-muted-foreground">Tél:</span> {selected.phone || "—"}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Sujet:</span> {selected.subject || "—"}</div>
              </div>
              <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap">{selected.message}</div>
              <p className="text-xs text-muted-foreground">Reçu le {new Date(selected.createdAt).toLocaleString("fr-FR")}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

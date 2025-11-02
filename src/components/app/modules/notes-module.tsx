
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useUser, useFirestore } from '@/firebase';
import { Loader2, StickyNote, Plus, Trash2, Edit } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { getNotes, addNote, updateNote, deleteNote, type Note } from '@/lib/firestore/notes';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

function NotesList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [currentContent, setCurrentContent] = useState('');

    useEffect(() => {
        if (user && firestore) {
            setIsLoading(true);
            const unsubscribe = getNotes(firestore, user.uid, (newNotes) => {
                setNotes(newNotes);
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else {
            setIsLoading(false);
            setNotes([]);
        }
    }, [user, firestore]);

    const handleEdit = (note: Note) => {
        setIsEditing(note.id);
        setCurrentContent(note.content);
    };

    const handleSave = (noteId: string) => {
        if (!user || !firestore) return;
        updateNote(firestore, user.uid, noteId, currentContent);
        toast({ title: 'Nota actualizada' });
        setIsEditing(null);
    };

    const handleDelete = (noteId: string) => {
        if (!user || !firestore) return;
        deleteNote(firestore, user.uid, noteId);
        toast({ title: 'Nota eliminada' });
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        return <p className="text-center text-muted-foreground">Inicia sesión para usar el bloc de notas.</p>;
    }
    
    return (
        <div className="space-y-4">
            {notes.map(note => (
                <div key={note.id} className="p-4 rounded-lg border bg-secondary/50">
                    {isEditing === note.id ? (
                        <div className="space-y-2">
                            <Textarea 
                                value={currentContent}
                                onChange={(e) => setCurrentContent(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleSave(note.id!)}>Guardar</Button>
                                <Button size="sm" variant="outline" onClick={() => setIsEditing(null)}>Cancelar</Button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(note.createdAt, { addSuffix: true, locale: es })}
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(note)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(note.id!)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function NewNoteForm({ onNoteAdded }: { onNoteAdded: () => void }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAddNote = () => {
        if (!user || !firestore || !content.trim()) return;
        
        setIsSaving(true);
        addNote(firestore, user.uid, content, () => {
            toast({ title: '¡Nota guardada!' });
            setContent('');
            setIsSaving(false);
            onNoteAdded();
        });
    };

    return (
        <div className="space-y-2">
            <Textarea 
                placeholder="Escribe tu nueva idea o tarea aquí..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px]"
            />
            <Button onClick={handleAddNote} disabled={isSaving || !content.trim()} className="w-full">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Guardar Nota
            </Button>
        </div>
    )
}

export function NotesModule() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("view");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full font-bold">Ver Notas</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2"><StickyNote /> Bloc de Notas</DialogTitle>
          <DialogDescription>
            Tu espacio personal para capturar ideas, recordatorios y tareas pendientes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex gap-2">
                <Button variant={activeTab === 'view' ? 'default' : 'outline'} onClick={() => setActiveTab('view')}>Ver Notas</Button>
                <Button variant={activeTab === 'add' ? 'default' : 'outline'} onClick={() => setActiveTab('add')}>Nueva Nota</Button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-1">
                {activeTab === 'view' && <NotesList />}
                {activeTab === 'add' && <NewNoteForm onNoteAdded={() => setActiveTab('view')} />}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    
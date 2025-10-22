
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Sparkles, User, Bot } from 'lucide-react';
import { askLuminar, type AskLuminarOutput } from '@/ai/flows/ask-luminar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';

type Message = {
    role: 'user' | 'model';
    content: string;
};

// Custom SVG Icon component based on the provided image
const LuminarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <defs>
            <linearGradient id="luminarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path d="M12 2 L12 12" stroke="url(#luminarGradient)" />
        <path d="M12 12 L6 22" stroke="url(#luminarGradient)" />
        <path d="M12 12 L18 22" stroke="url(#luminarGradient)" />
        <path d="M4 16 L20 16" stroke="url(#luminarGradient)" strokeWidth="1.5" />
    </svg>
);


function AssistantChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await askLuminar({
                question: input,
                history: messages,
            });
            const modelMessage: Message = { role: 'model', content: result.answer };
            setMessages(prev => [...prev, modelMessage]);
        } catch (e) {
            console.error(e);
            toast({
                title: "Error de Luminar",
                description: "No se pudo obtener una respuesta. Inténtalo de nuevo.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);


    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground p-8">
                            <LuminarIcon className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="font-semibold">Soy Luminar, tu asesor de IA.</h3>
                            <p className="text-sm">¿En qué puedo ayudarte a emprender hoy?</p>
                        </div>
                    )}
                    {messages.map((message, index) => (
                        <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                             {message.role === 'model' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 border-2 border-primary/50 text-primary"><LuminarIcon className="h-5 w-5" /></AvatarFallback>
                                </Avatar>
                             )}
                            <div className={`rounded-lg p-3 max-w-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                <div className="prose prose-sm dark:prose-invert text-sm max-w-none">
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                            </div>
                            {message.role === 'user' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 border-2 border-primary/50 text-primary"><Loader2 className="h-5 w-5 animate-spin" /></AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg p-3 bg-secondary">
                                <p className="text-sm text-muted-foreground">Luminar está pensando...</p>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ej: ¿Cómo puedo validar mi idea de negocio?"
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        disabled={isLoading}
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function LuminarAssistantRoot() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full font-bold"><Sparkles className="mr-2 h-4 w-4" /> Consultar Asesor</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                        <LuminarIcon className="h-6 w-6" /> Asesor de Negocios Luminar
                    </DialogTitle>
                    <DialogDescription>
                        Tu guía personal de IA para resolver dudas y crecer tu emprendimiento.
                    </DialogDescription>
                </DialogHeader>
                <AssistantChat />
            </DialogContent>
        </Dialog>
    );
}

export const LuminarAssistantModule = {
    Root: LuminarAssistantRoot,
    Icon: LuminarIcon
};

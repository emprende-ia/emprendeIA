'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Bot, User } from 'lucide-react';
import { askLuminar } from '@/ai/flows/ask-luminar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { useUser } from '@/firebase';


type Message = {
    role: 'user' | 'model';
    content: string;
};

const LUMINAR_AVATAR_URL = "https://i.postimg.cc/qBLMXpYM/luminar.png";

export const LuminarIcon = (props: React.SVGProps<SVGSVGElement> & { width?: number, height?: number }) => (
    <Image src={LUMINAR_AVATAR_URL} alt="Luminar Asesor" width={props.width || 32} height={props.height || 32} {...props} className="rounded-full" />
);


function AssistantChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const scrollAreaViewport = useRef<HTMLDivElement>(null);

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
            // Don't remove the user's message on error, so they can retry.
            // setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (scrollAreaViewport.current) {
            scrollAreaViewport.current.scrollTo({
                top: scrollAreaViewport.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isLoading]);


    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-1" viewportRef={scrollAreaViewport}>
                <div className="space-y-4 p-4">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground p-8">
                            <LuminarIcon className="mx-auto mb-4" width={64} height={64} />
                            <h3 className="font-semibold">Soy Luminar, tu asesor de IA.</h3>
                            <p className="text-sm">¿En qué puedo ayudarte a emprender hoy?</p>
                        </div>
                    )}
                    {messages.map((message, index) => (
                        <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                             {message.role === 'model' && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={LUMINAR_AVATAR_URL} alt="Luminar" />
                                    <AvatarFallback className="bg-primary/10 border-2 border-primary/50 text-primary"><Bot className="h-5 w-5" /></AvatarFallback>
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
                                <AvatarImage src={LUMINAR_AVATAR_URL} alt="Luminar" />
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
                        placeholder="Ej: ¿Cómo puedo validar mi idea?"
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

export function LuminarAssistantModule() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, isUserLoading } = useUser();

    // Do not render the button if the user is not logged in or auth state is loading.
    if (isUserLoading || !user) {
        return null;
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="default"
                    className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 flex items-center justify-center animate-in fade-in zoom-in-50"
                >
                    <LuminarIcon className="h-8 w-8" />
                    <span className="sr-only">Abrir Asesor Luminar</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                        <LuminarIcon className="h-8 w-8" /> Asesor de Negocios Luminar
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

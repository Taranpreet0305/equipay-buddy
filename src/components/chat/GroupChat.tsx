import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  user_id: string;
  message_type: string;
  created_at: string;
  profiles?: {
    display_name: string;
    photo_url: string | null;
  };
}

interface GroupChatProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GroupChat({ groupId, isOpen, onClose }: GroupChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen || !groupId) return;

    // Fetch existing messages
    const fetchMessages = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('group_messages')
        .select(`
          *,
          profiles:user_id (display_name, photo_url)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (data) {
        setMessages(data as Message[]);
      }
      setIsLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          // Fetch the complete message with profile
          const { data } = await supabase
            .from('group_messages')
            .select(`*, profiles:user_id (display_name, photo_url)`)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setIsSending(true);
    const { error } = await supabase.from('group_messages').insert({
      group_id: groupId,
      user_id: user.id,
      content: newMessage.trim(),
      message_type: 'text',
    });

    if (!error) {
      setNewMessage('');
    }
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Group Chat</h2>
                <p className="text-xs text-muted-foreground">{messages.length} messages</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-medium">No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.user_id === user?.id;
                const profile = message.profiles;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    {!isOwn && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={profile?.photo_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {profile?.display_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      {!isOwn && (
                        <p className="text-xs text-muted-foreground mb-1 ml-1">
                          {profile?.display_name || 'Unknown'}
                        </p>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-secondary text-foreground rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                      <p className={`text-[10px] text-muted-foreground mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border bg-card safe-area-bottom">
            <div className="flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 h-11 rounded-xl"
                disabled={isSending}
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                variant="gradient"
                size="icon"
                className="h-11 w-11 rounded-xl"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

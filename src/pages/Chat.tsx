import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { chatApi, Message } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Chat = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!token) return;
    try {
      const data = await chatApi.getMessages(token);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !messageText.trim()) return;

    try {
      const result = await chatApi.sendMessage(messageText, token);
      if (result.success) {
        setMessageText('');
        await loadMessages();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить сообщение', variant: 'destructive' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="border-2 border-black manga-shadow max-w-md">
          <CardContent className="p-8 text-center">
            <Icon name="Lock" size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Требуется авторизация</h2>
            <p className="text-gray-600 mb-4">
              Войдите в систему, чтобы общаться в чате
            </p>
            <Button onClick={() => navigate('/')}>Перейти на главную</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 w-full border-b border-black bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold font-heading">Общий чат</h1>
            <div className="w-24" />
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-black manga-shadow h-[calc(100vh-200px)] flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    <Icon name="MessageCircle" size={64} className="mx-auto mb-4 text-gray-300" />
                    <p>Пока нет сообщений. Начните общение!</p>
                  </div>
                )}

                {messages.map((message) => {
                  const isOwn = message.user_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          isOwn
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-black'
                        } rounded-lg p-4 border-2 border-black`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-semibold text-sm cursor-pointer hover:underline ${
                              isOwn ? 'text-white' : 'text-black'
                            }`}
                            onClick={() => navigate(`/profile/${message.user_id}`)}
                          >
                            {message.display_name}
                          </span>
                          <span
                            className={`text-xs ${
                              isOwn ? 'text-gray-300' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t-2 border-black p-4">
                <form onSubmit={handleSend} className="flex gap-3">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Написать сообщение..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!messageText.trim()}>
                    <Icon name="Send" size={18} />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black manga-shadow mt-6 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Users" size={18} />
                <span className="font-semibold">
                  Онлайн: {new Set(messages.slice(-20).map(m => m.user_id)).size} пользователей
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;

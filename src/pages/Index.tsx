import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { comicsApi, authApi, Comic } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { user, login, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [comics, setComics] = useState<Comic[]>([]);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    display_name: '',
  });

  useEffect(() => {
    loadComics();
  }, []);

  const loadComics = async () => {
    try {
      const data = await comicsApi.getAll();
      setComics(data.comics);
    } catch (error) {
      console.error('Failed to load comics:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await authApi.login(loginData.username, loginData.password);
      if (result.user) {
        login(result.user, result.token);
        setAuthDialogOpen(false);
        toast({ title: 'Добро пожаловать!', description: `Привет, ${result.user.display_name}` });
      } else {
        toast({ title: 'Ошибка', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось войти', variant: 'destructive' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await authApi.register(
        registerData.username,
        registerData.email,
        registerData.password,
        registerData.display_name
      );
      if (result.user) {
        login(result.user, result.token);
        setAuthDialogOpen(false);
        toast({ title: 'Регистрация успешна!', description: 'Добро пожаловать в сообщество' });
      } else {
        toast({ title: 'Ошибка', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось зарегистрироваться', variant: 'destructive' });
    }
  };

  const topComics = [...comics]
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 w-full border-b border-black bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold tracking-tight font-heading cursor-pointer" onClick={() => navigate('/')}>
                MANGA+
              </h1>
              <div className="hidden md:flex gap-6">
                <button className="text-sm font-medium text-black hover:text-gray-600">
                  Главная
                </button>
                {isAuthenticated && (
                  <>
                    <button onClick={() => navigate('/chat')} className="text-sm font-medium text-gray-500 hover:text-black">
                      Чат
                    </button>
                    <button onClick={() => navigate(`/profile/${user?.id}`)} className="text-sm font-medium text-gray-500 hover:text-black">
                      Профиль
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Button onClick={() => navigate('/upload')} size="sm" className="font-medium">
                    <Icon name="Upload" size={16} className="mr-2" />
                    Загрузить
                  </Button>
                  <Button onClick={logout} variant="outline" size="sm" className="font-medium">
                    Выйти
                  </Button>
                </>
              ) : (
                <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="font-medium">
                      Войти / Регистрация
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Вход в систему</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="login" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Вход</TabsTrigger>
                        <TabsTrigger value="register">Регистрация</TabsTrigger>
                      </TabsList>
                      <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div>
                            <Label htmlFor="login-username">Имя пользователя</Label>
                            <Input
                              id="login-username"
                              value={loginData.username}
                              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="login-password">Пароль</Label>
                            <Input
                              id="login-password"
                              type="password"
                              value={loginData.password}
                              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">Войти</Button>
                        </form>
                      </TabsContent>
                      <TabsContent value="register">
                        <form onSubmit={handleRegister} className="space-y-4">
                          <div>
                            <Label htmlFor="reg-username">Имя пользователя</Label>
                            <Input
                              id="reg-username"
                              value={registerData.username}
                              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-email">Email</Label>
                            <Input
                              id="reg-email"
                              type="email"
                              value={registerData.email}
                              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-display-name">Отображаемое имя</Label>
                            <Input
                              id="reg-display-name"
                              value={registerData.display_name}
                              onChange={(e) => setRegisterData({ ...registerData, display_name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="reg-password">Пароль</Label>
                            <Input
                              id="reg-password"
                              type="password"
                              value={registerData.password}
                              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">Зарегистрироваться</Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </nav>
        </div>
      </header>

      <section className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-b from-gray-100 to-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://cdn.poehali.dev/files/18f33c11-5a4b-4f82-8b77-0f2b676b951e.jpg"
            alt="Manga Hero"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <div className="max-w-2xl animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 font-heading text-black">
              Мир комиксов
            </h2>
            <p className="text-lg md:text-xl text-gray-800 mb-6">
              Создавай, публикуй и делись своими историями с сообществом художников
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6 font-heading">Новинки форума</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {comics.map((comic, index) => (
                  <Card
                    key={comic.id}
                    className="group overflow-hidden border-2 border-black manga-shadow transition-all hover:manga-shadow-hover hover:-translate-y-1 cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => navigate(`/comic/${comic.id}`)}
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                      <img
                        src={comic.cover_url || 'https://cdn.poehali.dev/files/18f33c11-5a4b-4f82-8b77-0f2b676b951e.jpg'}
                        alt={comic.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1 font-heading line-clamp-1">{comic.title}</h4>
                          <p className="text-sm text-gray-600 cursor-pointer hover:underline" onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${comic.user_id}`);
                          }}>
                            {comic.display_name}
                          </p>
                        </div>
                        {comic.genre && <Badge variant="secondary" className="ml-2 shrink-0">{comic.genre}</Badge>}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Icon name="Star" size={16} className="fill-black" />
                            <span className="font-semibold">{comic.avg_rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Icon name="Heart" size={16} />
                            <span>{comic.likes_count}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-2 border-black manga-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6 font-heading flex items-center gap-2">
                    <Icon name="TrendingUp" size={24} />
                    ТОП недели
                  </h3>
                  <div className="space-y-4">
                    {topComics.map((comic, idx) => (
                      <div
                        key={comic.id}
                        className="flex items-start gap-3 group cursor-pointer"
                        onClick={() => navigate(`/comic/${comic.id}`)}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm group-hover:underline line-clamp-2">{comic.title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Icon name="Star" size={14} className="fill-black" />
                            <span className="text-sm font-medium">{comic.avg_rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <Button variant="outline" className="w-full font-medium" onClick={() => navigate('/')}>
                    Посмотреть все
                  </Button>
                </CardContent>
              </Card>

              {isAuthenticated && (
                <Card className="border-2 border-black manga-shadow mt-6 bg-black text-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-3 font-heading">Стань автором</h3>
                    <p className="text-sm mb-4 text-gray-300">
                      Публикуй свои работы и получай отклики от тысяч читателей
                    </p>
                    <Button variant="secondary" className="w-full font-medium" onClick={() => navigate('/upload')}>
                      Загрузить комикс
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-black bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4 font-heading">MANGA+</h4>
              <p className="text-sm text-gray-600">
                Платформа для художников и любителей комиксов
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Навигация</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black">Главная</a></li>
                <li><a href="#" className="hover:text-black">Новинки</a></li>
                <li><a href="#" className="hover:text-black">Авторы</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Сообщество</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black">Форум</a></li>
                <li><a href="#" className="hover:text-black">Чат</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Помощь</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black">FAQ</a></li>
                <li><a href="#" className="hover:text-black">Правила</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-sm text-gray-600">
            <p>© 2025 MANGA+. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

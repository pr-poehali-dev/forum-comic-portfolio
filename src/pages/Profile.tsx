import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { comicsApi, Comic } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [userComics, setUserComics] = useState<Comic[]>([]);
  const [profileUser, setProfileUser] = useState<{ display_name: string; username: string } | null>(null);

  const isOwnProfile = isAuthenticated && user?.id === parseInt(userId || '0');

  useEffect(() => {
    if (userId) {
      loadUserComics();
    }
  }, [userId]);

  const loadUserComics = async () => {
    if (!userId) return;
    try {
      const data = await comicsApi.getByUser(parseInt(userId));
      setUserComics(data.comics);
      if (data.comics.length > 0) {
        setProfileUser({
          display_name: data.comics[0].display_name,
          username: data.comics[0].username || '',
        });
      }
    } catch (error) {
      console.error('Failed to load user comics:', error);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить профиль', variant: 'destructive' });
    }
  };

  const totalLikes = userComics.reduce((sum, comic) => sum + comic.likes_count, 0);
  const avgRating = userComics.length > 0
    ? userComics.reduce((sum, comic) => sum + comic.avg_rating, 0) / userComics.length
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 w-full border-b border-black bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-bold font-heading">MANGA+</h1>
            {isOwnProfile && (
              <Button onClick={() => navigate('/upload')} size="sm">
                <Icon name="Upload" size={16} className="mr-2" />
                Загрузить
              </Button>
            )}
            {!isOwnProfile && <div className="w-24" />}
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-2 border-black manga-shadow mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-4 border-black">
                  <span className="text-5xl font-bold text-white">
                    {profileUser?.display_name?.charAt(0) || user?.display_name?.charAt(0) || '?'}
                  </span>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold font-heading mb-2">
                    {profileUser?.display_name || user?.display_name || 'Пользователь'}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    @{profileUser?.username || user?.username || 'user'}
                  </p>
                  
                  <div className="flex flex-wrap gap-6 justify-center md:justify-start mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{userComics.length}</div>
                      <div className="text-sm text-gray-600">Работ</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{totalLikes}</div>
                      <div className="text-sm text-gray-600">Лайков</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Icon name="Star" size={20} className="fill-black" />
                        <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-gray-600">Средний рейтинг</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="works" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="works">Работы ({userComics.length})</TabsTrigger>
              <TabsTrigger value="about">О себе</TabsTrigger>
            </TabsList>

            <TabsContent value="works">
              {userComics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userComics.map((comic, index) => (
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
                          <h4 className="font-bold text-lg mb-1 font-heading line-clamp-1 flex-1">
                            {comic.title}
                          </h4>
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
              ) : (
                <Card className="border-2 border-black manga-shadow">
                  <CardContent className="p-12 text-center">
                    <Icon name="Image" size={64} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold mb-2">Пока нет работ</h3>
                    <p className="text-gray-600 mb-4">
                      {isOwnProfile
                        ? 'Загрузите свой первый комикс, чтобы начать строить портфолио'
                        : 'Этот пользователь еще не загрузил ни одной работы'}
                    </p>
                    {isOwnProfile && (
                      <Button onClick={() => navigate('/upload')}>
                        <Icon name="Upload" size={16} className="mr-2" />
                        Загрузить комикс
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="about">
              <Card className="border-2 border-black manga-shadow">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-4 font-heading">О художнике</h3>
                  <p className="text-gray-600 mb-6">
                    {isOwnProfile
                      ? 'Здесь будет информация о вас. Функционал в разработке.'
                      : 'Информация об авторе появится позже.'}
                  </p>

                  {isOwnProfile && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Icon name="Mail" size={18} />
                        <span>{user?.email || 'Не указано'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Icon name="Calendar" size={18} />
                        <span>Зарегистрирован: {user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : 'Неизвестно'}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { comicsApi, ComicDetail, Comment } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const ComicView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [comic, setComic] = useState<ComicDetail | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (id) {
      loadComic();
    }
  }, [id]);

  const loadComic = async () => {
    if (!id) return;
    try {
      const data = await comicsApi.getById(parseInt(id), token);
      setComic(data.comic);
      setComments(data.comments || []);
      setIsLiked(data.user_liked || false);
      setUserRating(data.user_rating || 0);
    } catch (error) {
      console.error('Failed to load comic:', error);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить комикс', variant: 'destructive' });
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !id || !token) {
      toast({ title: 'Войдите', description: 'Необходима авторизация' });
      return;
    }
    try {
      const result = await comicsApi.toggleLike(parseInt(id), token);
      if (result.success) {
        setIsLiked(result.liked);
        if (comic) {
          setComic({ ...comic, likes_count: comic.likes_count + (result.liked ? 1 : -1) });
        }
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось поставить лайк', variant: 'destructive' });
    }
  };

  const handleRate = async (rating: number) => {
    if (!isAuthenticated || !id || !token) {
      toast({ title: 'Войдите', description: 'Необходима авторизация' });
      return;
    }
    try {
      const result = await comicsApi.rate(parseInt(id), rating, token);
      if (result.success) {
        setUserRating(rating);
        if (comic) {
          setComic({ ...comic, avg_rating: result.new_avg_rating });
        }
        toast({ title: 'Готово', description: 'Ваша оценка учтена' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось оценить', variant: 'destructive' });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !id || !token || !commentText.trim()) return;
    
    try {
      const result = await comicsApi.addComment(parseInt(id), commentText, token);
      if (result.success && result.comment) {
        setComments([result.comment, ...comments]);
        setCommentText('');
        toast({ title: 'Готово', description: 'Комментарий добавлен' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить комментарий', variant: 'destructive' });
    }
  };

  if (!comic) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const currentPageData = comic.pages[currentPage];

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
            <div className="w-24" />
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-2 border-black manga-shadow mb-6">
              <CardContent className="p-0">
                <div className="relative bg-gray-100">
                  <img
                    src={currentPageData?.image_url || comic.cover_url}
                    alt={`Страница ${currentPage + 1}`}
                    className="w-full h-auto max-h-[800px] object-contain"
                  />
                  
                  {comic.pages.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 shadow-lg"
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                      >
                        <Icon name="ChevronLeft" size={24} />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 shadow-lg"
                        onClick={() => setCurrentPage(Math.min(comic.pages.length - 1, currentPage + 1))}
                        disabled={currentPage === comic.pages.length - 1}
                      >
                        <Icon name="ChevronRight" size={24} />
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Страница {currentPage + 1} из {comic.pages.length}
                    </span>
                    <div className="flex gap-2">
                      {comic.pages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentPage ? 'bg-black w-6' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black manga-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 font-heading">Комментарии ({comments.length})</h3>
                
                {isAuthenticated && (
                  <form onSubmit={handleComment} className="mb-6">
                    <Label htmlFor="comment">Оставить комментарий</Label>
                    <Textarea
                      id="comment"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Поделитесь своим мнением..."
                      className="mt-2 mb-3"
                      rows={3}
                    />
                    <Button type="submit" disabled={!commentText.trim()}>
                      <Icon name="Send" size={16} className="mr-2" />
                      Отправить
                    </Button>
                  </form>
                )}

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm cursor-pointer hover:underline" onClick={() => navigate(`/profile/${comment.user_id}`)}>
                          {comment.display_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Пока нет комментариев</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="border-2 border-black manga-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold font-heading mb-2">{comic.title}</h2>
                      <p className="text-sm text-gray-600 cursor-pointer hover:underline" onClick={() => navigate(`/profile/${comic.user_id}`)}>
                        {comic.display_name}
                      </p>
                    </div>
                    {comic.genre && <Badge>{comic.genre}</Badge>}
                  </div>

                  {comic.description && (
                    <p className="text-sm text-gray-700 mb-4">{comic.description}</p>
                  )}

                  <Separator className="my-4" />

                  <div className="flex items-center justify-around py-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Icon name="Star" size={20} className="fill-black" />
                        <span className="text-2xl font-bold">{comic.avg_rating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-gray-600">Рейтинг</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Icon name="Heart" size={20} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                        <span className="text-2xl font-bold">{comic.likes_count}</span>
                      </div>
                      <p className="text-xs text-gray-600">Лайков</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Icon name="FileText" size={20} />
                        <span className="text-2xl font-bold">{comic.pages.length}</span>
                      </div>
                      <p className="text-xs text-gray-600">Страниц</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {isAuthenticated && (
                    <>
                      <div className="mb-4">
                        <Label className="mb-2 block">Ваша оценка</Label>
                        <div className="flex gap-2 justify-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRate(star)}
                              className="transition-transform hover:scale-110"
                            >
                              <Icon
                                name="Star"
                                size={28}
                                className={star <= userRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant={isLiked ? 'default' : 'outline'}
                        className="w-full font-medium"
                        onClick={handleLike}
                      >
                        <Icon name="Heart" size={18} className={`mr-2 ${isLiked ? 'fill-white' : ''}`} />
                        {isLiked ? 'Убрать лайк' : 'Поставить лайк'}
                      </Button>
                    </>
                  )}

                  {!isAuthenticated && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 mb-3">Войдите, чтобы оценить</p>
                      <Button onClick={() => navigate('/')}>Войти</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 border-black manga-shadow">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-3 font-heading">Об авторе</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Посмотрите другие работы {comic.display_name}
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => navigate(`/profile/${comic.user_id}`)}>
                    Перейти в профиль
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicView;

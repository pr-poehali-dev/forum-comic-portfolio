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
import { comicsApi, interactionsApi, ComicDetail, Comment } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const ComicView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
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
      loadComments();
    }
  }, [id]);

  const loadComic = async () => {
    if (!id) return;
    try {
      const data = await comicsApi.getById(parseInt(id));
      setComic(data.comic);
    } catch (error) {
      console.error('Failed to load comic:', error);
      toast({ title: 'Ошибка', description: 'Не удалось загрузить комикс', variant: 'destructive' });
    }
  };

  const loadComments = async () => {
    if (!id) return;
    try {
      const data = await interactionsApi.getComments(parseInt(id));
      setComments(data.comments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !id || !user) {
      toast({ title: 'Войдите', description: 'Необходима авторизация' });
      return;
    }
    try {
      if (isLiked) {
        await interactionsApi.unlike(user.id, parseInt(id));
        setIsLiked(false);
        if (comic) {
          setComic({ ...comic, likes_count: comic.likes_count - 1 });
        }
      } else {
        const result = await interactionsApi.like(user.id, parseInt(id));
        setIsLiked(true);
        if (comic && result.likes_count) {
          setComic({ ...comic, likes_count: result.likes_count });
        }
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось поставить лайк', variant: 'destructive' });
    }
  };

  const handleRate = async (rating: number) => {
    if (!isAuthenticated || !id || !user) {
      toast({ title: 'Войдите', description: 'Необходима авторизация' });
      return;
    }
    try {
      const result = await interactionsApi.rate(user.id, parseInt(id), rating);
      setUserRating(rating);
      if (comic && result.avg_rating) {
        setComic({ ...comic, avg_rating: result.avg_rating });
      }
      toast({ title: 'Готово', description: 'Ваша оценка учтена' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось оценить', variant: 'destructive' });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !id || !user || !commentText.trim()) return;
    
    try {
      await interactionsApi.addComment(user.id, parseInt(id), commentText);
      setCommentText('');
      loadComments();
      toast({ title: 'Готово', description: 'Комментарий добавлен' });
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
                          {new Date(comment.created_at).toLocaleDateString('ru')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-gray-400 py-8">Комментариев пока нет</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-2 border-black manga-shadow sticky top-24">
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold mb-3 font-heading">{comic.title}</h1>
                
                {comic.genre && (
                  <Badge className="mb-4">{comic.genre}</Badge>
                )}
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Автор:</p>
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                    onClick={() => navigate(`/profile/${comic.user_id}`)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {comic.avatar_url ? (
                        <img src={comic.avatar_url} alt={comic.display_name} className="w-full h-full rounded-full" />
                      ) : (
                        <Icon name="User" size={16} />
                      )}
                    </div>
                    <span className="font-medium">{comic.display_name}</span>
                  </div>
                </div>

                {comic.description && (
                  <p className="text-sm text-gray-700 mb-4">{comic.description}</p>
                )}

                <Separator className="my-4" />

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Рейтинг:</span>
                    <div className="flex items-center gap-1">
                      <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{comic.avg_rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Лайки:</span>
                    <span className="font-semibold">{comic.likes_count}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    variant={isLiked ? "default" : "outline"} 
                    className="w-full"
                    onClick={handleLike}
                    disabled={!isAuthenticated}
                  >
                    <Icon name="Heart" size={16} className="mr-2" />
                    {isLiked ? 'Убрать лайк' : 'Поставить лайк'}
                  </Button>

                  {isAuthenticated && (
                    <div>
                      <Label className="text-sm mb-2">Оцените комикс:</Label>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRate(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Icon
                              name="Star"
                              size={24}
                              className={star <= userRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicView;

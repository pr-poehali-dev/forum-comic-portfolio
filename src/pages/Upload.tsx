import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/context/AuthContext';
import { comicsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Upload = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [pages, setPages] = useState<{ page_number: number; image_url: string }[]>([
    { page_number: 1, image_url: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="border-2 border-black manga-shadow max-w-md">
          <CardContent className="p-8 text-center">
            <Icon name="Lock" size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Требуется авторизация</h2>
            <p className="text-gray-600 mb-4">
              Войдите в систему, чтобы загружать комиксы
            </p>
            <Button onClick={() => navigate('/')}>Перейти на главную</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddPage = () => {
    setPages([...pages, { page_number: pages.length + 1, image_url: '' }]);
  };

  const handleRemovePage = (index: number) => {
    if (pages.length > 1) {
      const newPages = pages.filter((_, i) => i !== index);
      setPages(newPages.map((page, i) => ({ ...page, page_number: i + 1 })));
    }
  };

  const handlePageUrlChange = (index: number, url: string) => {
    const newPages = [...pages];
    newPages[index].image_url = url;
    setPages(newPages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Ошибка', description: 'Необходима авторизация', variant: 'destructive' });
      return;
    }

    const validPages = pages.filter(page => page.image_url.trim() !== '');
    if (validPages.length === 0) {
      toast({ title: 'Ошибка', description: 'Добавьте хотя бы одну страницу', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await comicsApi.create({
        user_id: user.id,
        title,
        description,
        genre: genre || null,
        cover_url: coverUrl || validPages[0].image_url,
        pages: validPages,
      });

      if (result.comic_id) {
        toast({ title: 'Успешно!', description: 'Комикс опубликован' });
        navigate(`/comic/${result.comic_id}`);
      } else {
        toast({ title: 'Ошибка', description: result.error || 'Не удалось создать комикс', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить комикс', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-black manga-shadow">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">Загрузить новый комикс</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Название комикса *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите название"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Расскажите о вашем комиксе..."
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="genre">Жанр</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Выберите жанр" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="фантастика">Фантастика</SelectItem>
                        <SelectItem value="фэнтези">Фэнтези</SelectItem>
                        <SelectItem value="приключения">Приключения</SelectItem>
                        <SelectItem value="романтика">Романтика</SelectItem>
                        <SelectItem value="комедия">Комедия</SelectItem>
                        <SelectItem value="драма">Драма</SelectItem>
                        <SelectItem value="ужасы">Ужасы</SelectItem>
                        <SelectItem value="экшен">Экшен</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cover">URL обложки</Label>
                    <Input
                      id="cover"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://..."
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Если не указано, будет использована первая страница
                    </p>
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label>Страницы комикса *</Label>
                    <Button type="button" size="sm" variant="outline" onClick={handleAddPage}>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить страницу
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {pages.map((page, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="flex-shrink-0 w-12 h-12 rounded bg-gray-100 flex items-center justify-center font-bold border-2 border-black">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <Input
                            value={page.image_url}
                            onChange={(e) => handlePageUrlChange(index, e.target.value)}
                            placeholder="URL изображения страницы"
                            required
                          />
                        </div>
                        {pages.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemovePage(index)}
                          >
                            <Icon name="Trash2" size={18} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    💡 Используйте прямые ссылки на изображения (jpg, png, webp)
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Icon name="Upload" size={18} className="mr-2" />
                        Опубликовать
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/profile/${user?.id}`)}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-2 border-black manga-shadow mt-6 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Icon name="Info" size={20} />
                Советы по загрузке
              </h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Используйте качественные изображения (рекомендуется 1200x1600px)</li>
                <li>Убедитесь, что страницы расположены в правильном порядке</li>
                <li>Выберите подходящий жанр для лучшей видимости</li>
                <li>Напишите интересное описание, чтобы привлечь читателей</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;
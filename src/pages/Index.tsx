import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeTab, setActiveTab] = useState('main');

  const featuredComics = [
    {
      id: 1,
      title: 'Звёздный путь',
      author: 'Анна Иванова',
      rating: 4.8,
      likes: 1234,
      cover: 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/dcff7292-d9ba-45a2-b608-7c45c6ae984d.jpg',
      genre: 'Фантастика',
      pages: 48
    },
    {
      id: 2,
      title: 'Тени прошлого',
      author: 'Дмитрий Петров',
      rating: 4.6,
      likes: 987,
      cover: 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/edb569ba-fc2d-4162-9c2d-c6a517207cb9.jpg',
      genre: 'Драма',
      pages: 32
    },
    {
      id: 3,
      title: 'Городские легенды',
      author: 'Мария Смирнова',
      rating: 4.9,
      likes: 1567,
      cover: 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/2ade5e46-ca7b-4354-af91-9e194dde951f.jpg',
      genre: 'Мистика',
      pages: 64
    },
    {
      id: 4,
      title: 'Последний самурай',
      author: 'Иван Соколов',
      rating: 4.7,
      likes: 1123,
      cover: 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/dcff7292-d9ba-45a2-b608-7c45c6ae984d.jpg',
      genre: 'Боевик',
      pages: 56
    },
    {
      id: 5,
      title: 'Цифровой мир',
      author: 'Елена Волкова',
      rating: 4.5,
      likes: 892,
      cover: 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/edb569ba-fc2d-4162-9c2d-c6a517207cb9.jpg',
      genre: 'Киберпанк',
      pages: 40
    },
    {
      id: 6,
      title: 'Весенний дождь',
      author: 'Ольга Новикова',
      rating: 4.8,
      likes: 1345,
      cover: 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/2ade5e46-ca7b-4354-af91-9e194dde951f.jpg',
      genre: 'Романтика',
      pages: 28
    }
  ];

  const topWeek = [
    { rank: 1, title: 'Городские легенды', rating: 4.9 },
    { rank: 2, title: 'Звёздный путь', rating: 4.8 },
    { rank: 3, title: 'Весенний дождь', rating: 4.8 },
    { rank: 4, title: 'Последний самурай', rating: 4.7 },
    { rank: 5, title: 'Тени прошлого', rating: 4.6 }
  ];

  const genres = ['Все жанры', 'Фантастика', 'Драма', 'Мистика', 'Боевик', 'Киберпанк', 'Романтика'];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-black bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold tracking-tight font-heading">MANGA+</h1>
              <div className="hidden md:flex gap-6">
                <button 
                  onClick={() => setActiveTab('main')}
                  className={`text-sm font-medium transition-colors hover:text-gray-600 ${activeTab === 'main' ? 'text-black font-semibold' : 'text-gray-500'}`}
                >
                  Главная
                </button>
                <button 
                  onClick={() => setActiveTab('new')}
                  className={`text-sm font-medium transition-colors hover:text-gray-600 ${activeTab === 'new' ? 'text-black font-semibold' : 'text-gray-500'}`}
                >
                  Новинки
                </button>
                <button 
                  onClick={() => setActiveTab('genres')}
                  className={`text-sm font-medium transition-colors hover:text-gray-600 ${activeTab === 'genres' ? 'text-black font-semibold' : 'text-gray-500'}`}
                >
                  Жанры
                </button>
                <button 
                  onClick={() => setActiveTab('authors')}
                  className={`text-sm font-medium transition-colors hover:text-gray-600 ${activeTab === 'authors' ? 'text-black font-semibold' : 'text-gray-500'}`}
                >
                  Авторы
                </button>
              </div>
            </div>
            <Button variant="default" size="sm" className="font-medium">
              Регистрация
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
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
            <div className="flex gap-4">
              <Button size="lg" className="font-medium">
                Начать создавать
              </Button>
              <Button size="lg" variant="outline" className="font-medium">
                Посмотреть новинки
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Comics Grid */}
          <div className="lg:col-span-3">
            {/* Genre Filter */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 font-heading">Жанры</h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Badge 
                    key={genre} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-black hover:text-white transition-colors px-4 py-2 text-sm"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Comics Grid */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6 font-heading">Новинки</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredComics.map((comic, index) => (
                  <Card 
                    key={comic.id} 
                    className="group overflow-hidden border-2 border-black manga-shadow transition-all hover:manga-shadow-hover hover:-translate-y-1 cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                      <img 
                        src={comic.cover} 
                        alt={comic.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1 font-heading line-clamp-1">{comic.title}</h4>
                          <p className="text-sm text-gray-600">{comic.author}</p>
                        </div>
                        <Badge variant="secondary" className="ml-2 shrink-0">{comic.genre}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Icon name="Star" size={16} className="fill-black" />
                            <span className="font-semibold">{comic.rating}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Icon name="Heart" size={16} />
                            <span>{comic.likes}</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{comic.pages} стр.</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Top of the Week */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-2 border-black manga-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-6 font-heading flex items-center gap-2">
                    <Icon name="TrendingUp" size={24} />
                    ТОП недели
                  </h3>
                  <div className="space-y-4">
                    {topWeek.map((item) => (
                      <div key={item.rank} className="flex items-start gap-3 group cursor-pointer">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                          {item.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm group-hover:underline line-clamp-2">{item.title}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Icon name="Star" size={14} className="fill-black" />
                            <span className="text-sm font-medium">{item.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <Button variant="outline" className="w-full font-medium">
                    Посмотреть все
                  </Button>
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Card className="border-2 border-black manga-shadow mt-6 bg-black text-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-3 font-heading">Стань автором</h3>
                  <p className="text-sm mb-4 text-gray-300">
                    Публикуй свои работы и получай отклики от тысяч читателей
                  </p>
                  <Button variant="secondary" className="w-full font-medium">
                    Загрузить комикс
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                <li><a href="#" className="hover:text-black">Жанры</a></li>
                <li><a href="#" className="hover:text-black">Авторы</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Сообщество</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black">Форум</a></li>
                <li><a href="#" className="hover:text-black">Чат</a></li>
                <li><a href="#" className="hover:text-black">Конкурсы</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Помощь</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-black">FAQ</a></li>
                <li><a href="#" className="hover:text-black">Правила</a></li>
                <li><a href="#" className="hover:text-black">Контакты</a></li>
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

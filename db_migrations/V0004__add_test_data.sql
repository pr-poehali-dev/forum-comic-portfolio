-- Insert test users
INSERT INTO users (username, email, password_hash, display_name, bio) VALUES
('artist1', 'artist1@test.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Художник Сакура', 'Люблю рисовать фэнтези и приключения'),
('artist2', 'artist2@test.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Мастер Кисти', 'Профессиональный мангака с 10-летним стажем'),
('artist3', 'artist3@test.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Неко-сан', 'Рисую милых персонажей и юмор')
ON CONFLICT (username) DO NOTHING;

-- Insert test comics
INSERT INTO comics (user_id, title, description, genre, cover_url) VALUES
(1, 'Воительница Теней', 'История о таинственной воительнице, которая сражается со злом в ночных улицах города', 'Экшен', 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/4faf5c47-805f-4db5-85b5-400fa67512b6.jpg'),
(2, 'Меч Судьбы', 'Молодой герой отправляется в эпическое приключение, чтобы найти легендарный меч', 'Фэнтези', 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/ae0e02bf-dd48-454b-89c5-5d5929fe6991.jpg'),
(3, 'Киберпанк 2099', 'Детектив расследует загадочные преступления в неоновом мегаполисе будущего', 'Киберпанк', 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/806dadb6-1698-46f7-b1bf-cff023ddb2ce.jpg')
ON CONFLICT DO NOTHING;

-- Insert comic pages
INSERT INTO comic_pages (comic_id, page_number, image_url, caption) VALUES
(1, 1, 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/4faf5c47-805f-4db5-85b5-400fa67512b6.jpg', 'Глава 1: Встреча в темноте'),
(1, 2, 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/4faf5c47-805f-4db5-85b5-400fa67512b6.jpg', 'Битва начинается...'),
(2, 1, 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/ae0e02bf-dd48-454b-89c5-5d5929fe6991.jpg', 'Начало путешествия'),
(2, 2, 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/ae0e02bf-dd48-454b-89c5-5d5929fe6991.jpg', 'Встреча с волшебником'),
(3, 1, 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/806dadb6-1698-46f7-b1bf-cff023ddb2ce.jpg', 'Ночной город'),
(3, 2, 'https://cdn.poehali.dev/projects/df02edd6-031b-4a59-8f18-cc9373450181/files/806dadb6-1698-46f7-b1bf-cff023ddb2ce.jpg', 'Следы преступления')
ON CONFLICT DO NOTHING;

-- Insert test ratings
INSERT INTO ratings (user_id, comic_id, rating) VALUES
(1, 2, 5),
(1, 3, 4),
(2, 1, 5),
(2, 3, 5),
(3, 1, 4),
(3, 2, 4)
ON CONFLICT DO NOTHING;

-- Insert test likes
INSERT INTO likes (user_id, comic_id) VALUES
(1, 2),
(1, 3),
(2, 1),
(2, 3),
(3, 1),
(3, 2)
ON CONFLICT DO NOTHING;

-- Insert test comments
INSERT INTO comments (user_id, comic_id, content) VALUES
(2, 1, 'Потрясающая графика! Обожаю стиль рисовки'),
(3, 1, 'Сюжет очень захватывающий, жду продолжения!'),
(1, 2, 'Классное фэнтези! Напоминает старые добрые манги'),
(3, 2, 'Герой очень харизматичный, отличная работа!'),
(1, 3, 'Киберпанк в лучших традициях жанра!'),
(2, 3, 'Атмосфера невероятная, хочу больше страниц!')
ON CONFLICT DO NOTHING;

-- Insert test chat messages
INSERT INTO chat_messages (user_id, message) VALUES
(1, 'Всем привет! Рада быть здесь 👋'),
(2, 'Добро пожаловать в наше сообщество художников!'),
(3, 'Привет всем! Кто-нибудь работает над новыми проектами?'),
(1, 'Да, я сейчас делаю продолжение "Воительницы Теней"'),
(2, 'Звучит интересно! Буду ждать')
ON CONFLICT DO NOTHING;
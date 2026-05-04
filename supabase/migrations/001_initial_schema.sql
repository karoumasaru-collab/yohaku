-- Yohaku Phase 1 Initial Schema

-- users テーブル
create table users (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  email         text unique,
  display_name  text,
  birthday      date,
  timezone      text default 'Asia/Tokyo',
  push_token    text,
  push_enabled  boolean default true,
  notify_hour   int default 7,
  role          text default 'both'
);

-- books テーブル
create table books (
  id            uuid primary key default gen_random_uuid(),
  isbn          text unique,
  title         text not null,
  author        text,
  publisher     text,
  published_at  date,
  cover_url     text,
  description   text,
  amazon_url    text,
  is_whitelisted boolean default false,
  created_at    timestamptz default now()
);

-- phrases テーブル（核心テーブル）
create table phrases (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  sender_id     uuid references users(id),
  book_id       uuid references books(id),
  text          text not null,
  page_number   int,
  tags          text[] not null,
  ai_tags       text[],
  image_url     text,
  status        text default 'active',
  delivered_count int default 0,
  hit_count     int default 0,
  rarity        text default 'normal'
);

-- deliveries テーブル（配信記録）
create table deliveries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  delivered_at  timestamptz,
  phrase_id     uuid references phrases(id),
  receiver_id   uuid references users(id),
  sender_id     uuid references users(id),
  mood_tag      text,
  is_hit        boolean default false,
  is_passed     boolean default false,
  notified_sender boolean default false,
  status        text default 'pending'
);

-- user_stats テーブル（集計キャッシュ）
create table user_stats (
  user_id           uuid primary key references users(id),
  updated_at        timestamptz default now(),
  total_sent        int default 0,
  total_books_sent  int default 0,
  total_hit         int default 0,
  current_streak    int default 0,
  longest_streak    int default 0,
  last_sent_month   text,
  total_received    int default 0,
  total_hit_received int default 0,
  top_tags          jsonb,
  birthday_delivered boolean default false,
  anniversary_notified boolean default false
);

-- publisher_campaigns テーブル（版元B2B）
create table publisher_campaigns (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  publisher     text not null,
  book_id       uuid references books(id),
  phrase_id     uuid references phrases(id),
  label         text default '編集部のおすすめ',
  start_date    date not null,
  end_date      date not null,
  daily_quota   int default 100,
  delivered_count int default 0,
  status        text default 'active'
);

-- インデックス
create index on phrases(sender_id);
create index on phrases(tags) using gin;
create index on deliveries(receiver_id, created_at desc);
create index on deliveries(phrase_id);
create index on deliveries(status);

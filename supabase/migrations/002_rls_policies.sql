-- Row Level Security ポリシー

alter table users enable row level security;
alter table books enable row level security;
alter table phrases enable row level security;
alter table deliveries enable row level security;
alter table user_stats enable row level security;

-- users: 自分のレコードのみ読み書き可
create policy "users_self" on users
  for all using (auth.uid() = id);

-- books: 全員読み取り可、認証済みユーザーが挿入可
create policy "books_read_all" on books
  for select using (true);

create policy "books_insert_auth" on books
  for insert with check (auth.role() = 'authenticated');

-- phrases: 全員読み取り可（activeのみ）、送り手が自分のものを管理
create policy "phrases_read_active" on phrases
  for select using (status = 'active');

create policy "phrases_insert_sender" on phrases
  for insert with check (auth.uid() = sender_id);

create policy "phrases_update_sender" on phrases
  for update using (auth.uid() = sender_id);

-- deliveries: 自分の受け取りまたは送り
create policy "deliveries_own" on deliveries
  for all using (
    auth.uid() = receiver_id or auth.uid() = sender_id
  );

-- user_stats: 自分のみ
create policy "user_stats_self" on user_stats
  for all using (auth.uid() = user_id);

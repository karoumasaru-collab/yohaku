-- ユーザー作成時に user_stats を自動作成するトリガー

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 配信時に phrases.delivered_count を更新するトリガー
create or replace function update_phrase_delivered_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update phrases set delivered_count = delivered_count + 1
    where id = new.phrase_id;

    update user_stats
    set total_received = total_received + 1,
        updated_at = now()
    where user_id = new.receiver_id;
  end if;
  return new;
end;
$$;

create trigger on_delivery_created
  after insert on deliveries
  for each row execute procedure update_phrase_delivered_count();

-- 「刺さった」時に hit_count を更新するトリガー
create or replace function update_hit_counts()
returns trigger language plpgsql as $$
begin
  if new.is_hit = true and old.is_hit = false then
    update phrases set hit_count = hit_count + 1
    where id = new.phrase_id;

    update user_stats
    set total_hit_received = total_hit_received + 1,
        updated_at = now()
    where user_id = new.receiver_id;

    -- 送り手の total_hit も更新
    update user_stats
    set total_hit = total_hit + 1,
        updated_at = now()
    where user_id = new.sender_id;
  end if;
  return new;
end;
$$;

create trigger on_delivery_hit
  after update on deliveries
  for each row execute procedure update_hit_counts();

-- フレーズ投稿時に送り手の統計を更新
create or replace function update_sender_stats()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update user_stats
    set total_sent = total_sent + 1,
        updated_at = now()
    where user_id = new.sender_id;
  end if;
  return new;
end;
$$;

create trigger on_phrase_created
  after insert on phrases
  for each row execute procedure update_sender_stats();

-- 有名な名言のシードデータ
-- 著作権切れ・パブリックドメインの作品より抜粋

-- 外国の著者・作品を追加
insert into books (isbn, title, author, publisher, cover_url, is_whitelisted) values
  ('9784003200011', '自省録',           'マルクス・アウレリウス', null, null, true),
  ('9784003200028', 'ファウスト',         'ヨハン・ヴォルフガング・フォン・ゲーテ', null, null, true),
  ('9784003200035', '幸福論',           'アラン', null, null, true),
  ('9784003200042', 'ツァラトゥストラ',    'フリードリヒ・ニーチェ', null, null, true),
  ('9784003200059', 'カラマーゾフの兄弟',  'フョードル・ドストエフスキー', null, null, true),
  ('9784003200066', '戦争と平和',        'レフ・トルストイ', null, null, true),
  ('9784003200073', 'アンネの日記',       'アンネ・フランク', null, null, true),
  ('9784003200080', 'ハムレット',        'ウィリアム・シェイクスピア', null, null, true)
on conflict (isbn) do nothing;

-- 名言を phrases テーブルに登録（sender_id は null = システム投稿）
-- ▼ 孤独・哲学
insert into phrases (book_id, text, tags, rarity, status) values
  (
    (select id from books where isbn = '9784003100097'),
    '智に働けば角が立つ。情に棹させば流される。意地を通せば窮屈だ。とかくに人の世は住みにくい。',
    array['哲学', '孤独'],
    'rare', 'active'
  ),
  (
    (select id from books where isbn = '9784003100097'),
    '自分の心を偽ってまで、世間に調和しようとするのは、かえって世間に対する侮辱だ。',
    array['哲学'],
    'normal', 'active'
  ),
  (
    (select id from books where isbn = '9784003100073'),
    '恥の多い生涯を送ってきました。',
    array['孤独', '哲学'],
    'rare', 'active'
  ),
  (
    (select id from books where isbn = '9784003100073'),
    '自分には、人間の生活というものが、見当つかないのです。',
    array['孤独'],
    'normal', 'active'
  ),
  (
    (select id from books where isbn = '9784003100103'),
    '臆病な自尊心と尊大な羞恥心とを持った男がいる。',
    array['孤独', '哲学'],
    'normal', 'active'
  ),

-- ▼ 挑戦・生き方
  (
    (select id from books where isbn = '9784003100080'),
    '走れ！メロス。',
    array['挑戦'],
    'normal', 'active'
  ),
  (
    (select id from books where isbn = '9784003100028'),
    '親譲りの無鉄砲で子供の時から損ばかりしている。',
    array['挑戦'],
    'normal', 'active'
  ),
  (
    (select id from books where isbn = '9784003200028'),
    '人間は努力する限り、迷うものだ。',
    array['挑戦', '哲学'],
    'rare', 'active'
  ),
  (
    (select id from books where isbn = '9784003200042'),
    '自分を超えていくものを創れ。そうすれば汝は正当化される。',
    array['挑戦'],
    'rare', 'active'
  ),

-- ▼ 愛・人間関係
  (
    (select id from books where isbn = '9784003100097'),
    '愛は罪悪だと彼はついに悟った。',
    array['愛'],
    'normal', 'active'
  ),
  (
    (select id from books where isbn = '9784003100066'),
    '美しいものを美しいと感じられる、それが一番の幸福ではないだろうか。',
    array['愛', '自然'],
    'rare', 'active'
  ),
  (
    (select id from books where isbn = '9784003200059'),
    '美は恐るべきものだ。それは闘いの場所なのだ。神と悪魔の。',
    array['愛', '哲学'],
    'rare', 'active'
  ),
  (
    (select id from books where isbn = '9784003200066'),
    '幸福な家庭はすべて互いに似通っているが、不幸な家庭はそれぞれの形で不幸だ。',
    array['愛', '家族'],
    'rare', 'active'
  ),
  (
    (select id from books where isbn = '9784003200073'),
    'それでも私は、人の心は本来善いものだと信じている。',
    array['愛', '哲学'],
    'rare', 'active'
  ),

-- ▼ 時間・死生観
  (
    (select id from books where isbn = '9784003200011'),
    '時間を無駄に費やすな。なぜなら人生とは時間の集積だから。',
    array['時間', '哲学'],
    'normal', 'active'
  ),
  (
    (select id from books where isbn = '9784003200011'),
    '過去にも未来にも気を散らすな。現在だけに集中せよ。',
    array['時間', '哲学'],
    'rare', 'active'
  ),
  (
    (select id from books where isbn = '9784003100042'),
    'ぼくは銀河鉄道の切符を持っている。どこへでも行ける。',
    array['時間', '旅'],
    'normal', 'active'
  ),
  (
    (select id from books where isbn = '9784003100011'),
    '人生は地獄よりも地獄的だ。',
    array['死生観', '哲学'],
    'normal', 'active'
  ),
  (
    (select id from books where isbn = '9784003200080'),
    '生きるべきか、死ぬべきか、それが問題だ。',
    array['死生観', '哲学'],
    'rare', 'active'
  ),

-- ▼ 自然・科学
  (
    (select id from books where isbn = '9784003100042'),
    '雨ニモマケズ　風ニモマケズ　雪ニモ夏ノ暑サニモマケヌ　丈夫ナカラダヲモチ。',
    array['自然', '挑戦'],
    'rare', 'active'
  ),

-- ▼ 幸福
  (
    (select id from books where isbn = '9784003200035'),
    '悲観主義は気分によるものであり、楽観主義は意志によるものだ。',
    array['哲学'],
    'rare', 'active'
  ),
  (
    (select id from books where isbn = '9784003200035'),
    '行動することが幸福への唯一の道だ。待っているだけでは何も来ない。',
    array['挑戦'],
    'normal', 'active'
  );

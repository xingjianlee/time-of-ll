# 重构计划：从「专属 L&L」到「所有情侣可用」

把现在硬编码的 sunny/felix 双人手账，改造成任意情侣都能注册使用的平台。本计划分三步：先做静态页面 → 再落地数据库重置 → 最后接通业务逻辑。

---

## 一、本轮要新建/改造的页面（先做静态版）

### 1. 未登录首页 `/`（公开 Hero）
- 隐藏 Home/Timeline/Wishlist/Giftjar 导航，只保留 Login / Sign up。
- 全屏 Hero：品牌名（Time of Us）、一句 slogan、CTA「开始我们的故事」。
- 滚动展示 3 个产品特性：纪念日计时 / 拍立得墙 / 旅行时光轴。
- 底部 CTA 注册。

### 2. 登录后首页 `/`
- 顶栏显示 `Welcome, {displayName}`，导航恢复 Home/Timeline/Wishlist/Giftjar/收信箱/设置。
- 标题 `Time of {nameA} & {nameB}`、纪念日、那段文案 全部从数据库 `couples` 表读取（未绑定情侣时显示个人占位 + 引导绑定）。

### 3. 设置页 `/settings`
- 个人信息：昵称、头像、邮箱（只读）。
- 情侣绑定：
  - 显示当前情侣状态（未绑定 / 待对方确认 / 已绑定）。
  - 输入对方邮箱发起绑定邀请；已绑定可解绑。
- 情侣空间：纪念日日期、首页 slogan 文案、情侣名（A & B 顺序）—— 双方都能改。
- 危险区：登出、删除账号。

### 4. 收信箱 `/inbox`
- 通知列表，按时间倒序，未读高亮，可标记已读 / 全部已读。
- 通知类型：
  - `couple_invite` — 谁绑定了你（含「同意 / 拒绝」按钮）。
  - `anniversary_milestone` — 每满 50 天提醒（100、150、200…）。
  - `wish_added` / `wish_completed` — 对方更新了 wishlist。
  - `gift_added` / `gift_given` — 对方更新了 giftjar。
  - `photo_added` / `timeline_added` — 对方加了新回忆。
- 顶栏铃铛图标显示未读小红点。

---

## 二、数据库重置方案

现有表 `photos / timeline / wishes / gifts` 使用 `owner enum('sunny','felix')` + 白名单邮箱 + `is_couple()`，无法支撑多情侣，必须重建。

### 新表结构

```text
profiles            个人资料（1:1 auth.users）
  id uuid PK = auth.uid
  display_name text
  avatar_url text
  created_at

couples             情侣空间
  id uuid PK
  name_a text           显示用名字
  name_b text
  anniversary date
  slogan text           首页文案，默认给一句
  created_at

couple_members      情侣成员（保证一个用户同时只在一个 active 情侣里）
  couple_id uuid FK
  user_id uuid FK
  role 'a' | 'b'
  PRIMARY KEY (couple_id, user_id)
  UNIQUE (user_id) WHERE status='active'

couple_invites      绑定邀请
  id uuid PK
  from_user uuid
  to_email text
  to_user uuid NULL    （对方注册后回填）
  couple_id uuid       （创建时即生成草稿 couple）
  status 'pending'|'accepted'|'declined'|'cancelled'
  created_at

notifications       收信箱
  id uuid PK
  user_id uuid         收件人
  type text
  payload jsonb        （含 actor、couple_id、wish_id 等）
  read_at timestamptz NULL
  created_at

photos / timeline / wishes / gifts
  把 owner enum 改为 owner_user uuid（指向 auth.users）
  新增 couple_id uuid FK
  created_by uuid 保留
```

### RLS 策略（统一通过 helper 函数）

```sql
-- 当前用户所属的 active 情侣 id
create function current_couple_id() returns uuid …
-- 当前用户是否属于该 couple
create function is_member_of(c uuid) returns boolean …
```

- `profiles`：自己可读写；他人只读 `display_name, avatar_url`。
- `couples / photos / timeline / wishes / gifts`：`couple_id = current_couple_id()` 时可读写。
- `couple_invites`：发起人或被邀请邮箱/用户可见。
- `notifications`：`user_id = auth.uid()` 可读、可标记已读。

### 自动化触发器

- 接受邀请 → 自动写入 `couple_members`、把双方旧数据迁移到新 couple（或丢弃，待你确认）。
- `wishes / gifts / photos / timeline` insert/update → trigger 给对方写一条 `notifications`。
- pg_cron 每天 03:00 扫描 couples，若距 anniversary 的天数是 50 的倍数 → 给双方发通知。

### 数据迁移

由于业务模型变化大，**建议直接清空旧数据**（你和 felix 重新登录后会生成新的 couple，再手动重新录入）。如果想保留：可以一次性把现有 photos/timeline/wishes/gifts 全部 owner_user 设为你（sunny）的 uuid，couple_id 设为新建的 sunny+felix couple。

---

## 三、实施顺序

**Phase 1（本轮，仅前端静态）**
1. 新增 `/settings`、`/inbox` 路由，全部用 mock 数据。
2. 改造 `/` 未登录态：Hero + 注册引导。
3. SiteHeader：登录态切换、加铃铛和「设置」入口、移除硬编码 Sunny&Felix 文案。
4. 不动数据库，旧 wishlist/giftjar/timeline 继续用旧表跑着（避免破坏现有可用功能）。

**Phase 2（确认后）**
1. 跑新建表 + RLS 迁移。
2. 写 `useProfile / useCouple / useInbox / useCoupleInvite` hooks。
3. 把 photos/timeline/wishes/gifts 的 owner 字段切换到 `owner_user + couple_id`。
4. 开启注册（邮箱/密码 + Google），去掉邮箱白名单。

**Phase 3**
1. 通知触发器 + 50 天纪念日 cron。
2. 头像上传、解绑流程、删除账号。

---

## 需要你确认的几点

1. **注册方式**：邮箱密码 + Google 登录，开放注册（去掉白名单）。可以吗？
2. **旧数据**：你和 felix 现有的 wishlist/giftjar/photos 是要**保留并迁移**到新结构，还是**清空重来**？
3. **绑定流程**：用「输入对方邮箱发邀请」就行，还是要再支持「6 位邀请码」？
4. **Phase 1 范围**：本轮我只做静态页面 + 路由（不动 DB），你检查 UI 满意后再进入 Phase 2，对吗？

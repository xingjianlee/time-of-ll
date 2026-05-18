# 数据库重构方案：从「单情侣硬编码」到「多租户情侣平台」

## 一、要不要新建一个 Supabase 项目？

**建议：不要新建，原地重构即可。** 理由：

1. 当前项目的 auth、storage bucket（`journal`）、env 变量、RLS helper 都已经配好，新建项目意味着重新配置 + 重新上传所有图片 + 重新登录，收益为零。
2. 业务表只有 4 张（photos / timeline / wishes / gifts），全部是「加字段 + 改 RLS」级别的改造，不是推倒重来。
3. 你和 felix 现有的数据是有感情价值的，原地迁移可以无缝保留。

**唯一应该新建项目的场景**：你想保留现在这个网站作为"私人版"永远只服务你俩，再开一个全新项目做"公开版 SaaS"。如果是这个想法请告诉我，方案会完全不同。

下面默认走「原地重构」。

---

## 二、原表要不要重构？要，但是渐进式

四张老表 `photos / timeline / wishes / gifts` 的硬伤是同一个：
- `owner` 是 `enum('sunny','felix')`，把用户身份焊死在两个名字上
- RLS 用 `is_couple()` 检查邮箱白名单，新用户进不来
- 没有 `couple_id`，无法区分"哪对情侣的数据"

**改造方式（每张表都一样）：**

```text
新增字段：
  couple_id   uuid    references couples(id) on delete cascade
  owner_user  uuid    references auth.users(id)   -- 替代 owner enum

保留字段：
  created_by  uuid    （已有，不动）
  其他业务字段（src/caption/text/title/...）全部不动

删除字段：
  owner       partner enum   （迁移完成后 drop）
```

RLS 全部换成基于 `couple_id = current_couple_id()` 的策略，`is_couple()` 函数和 `partner` enum 在最后一步删除。

---

## 三、新增的表

```text
profiles              个人资料（与 auth.users 1:1）
  id, display_name, avatar_url, created_at

couples               情侣空间
  id, name_a, name_b, anniversary, slogan, created_at

couple_members        成员关系（同一 user 同时只能属于一个 active couple）
  couple_id, user_id, role('a'|'b'), status, joined_at
  UNIQUE(user_id) WHERE status='active'

couple_invites        绑定邀请
  id, from_user, to_email, to_user, couple_id,
  status('pending'|'accepted'|'declined'|'cancelled'), created_at

notifications         收信箱
  id, user_id, type, payload jsonb, read_at, created_at
```

Helper 函数（用 `security definer` 避免 RLS 递归）：

```text
current_couple_id()         -> uuid   当前用户的 active couple
is_member_of(c uuid)        -> bool   当前用户是否属于该 couple
```

---

## 四、迁移分三步（每一步都可单独 rollback）

### Step 1：建新表 + 不动旧表（零风险）
- 创建 profiles / couples / couple_members / couple_invites / notifications
- 创建 helper 函数 + RLS
- 给 auth.users 加 trigger：注册时自动建 profile
- **旧表继续跑，前端无感知**

### Step 2：旧表加字段 + 双写过渡
- `alter table photos/timeline/wishes/gifts add column couple_id uuid, add column owner_user uuid`
- 用一次性脚本把你和 felix 的现有数据迁移到一个新的 couple：
  ```sql
  -- 伪代码
  insert into couples(name_a, name_b, anniversary, slogan)
       values ('Sunny','Felix','2022-08-08','把走过的城市…');
  insert into couple_members 双方;
  update photos set couple_id = <新id>,
         owner_user = case owner when 'sunny' then <sunny_uid>
                                 when 'felix' then <felix_uid> end;
  -- timeline / wishes / gifts 同理
  ```
- RLS 改成 `couple_id = current_couple_id()`，老的 `is_couple()` policy 删掉
- 前端 hooks（`usePhotos / useTimeline / useWishes / useGifts`）改成读写 `couple_id + owner_user`，不再用 `ownerForEmail`

### Step 3：清理（确认 Step 2 跑通后）
- `alter table ... drop column owner`
- `drop type partner`
- `drop function is_couple()`
- 删除 `WHITELIST` 常量
- 开放注册（去掉邮箱白名单）

---

## 五、自动化（Phase 3，本次重构不必一次性做完）

- `wishes / gifts / photos / timeline` 的 insert/update trigger → 给对方写一条 notification
- 接受 `couple_invite` trigger → 写 couple_members + 关闭其他 pending 邀请
- `pg_cron` 每天扫 couples，距 anniversary 是 50 的倍数 → 给双方发通知

---

## 需要你确认的 3 件事

1. **新建 vs 原地**：确认走「原地重构」，不新建 Supabase 项目？
2. **现有数据**：你和 felix 的 wishlist/giftjar/photos 要**迁移保留**（Step 2 的脚本会处理）还是**直接清空**？
3. **执行节奏**：我先跑 Step 1（建新表，零风险），还是 Step 1+2 一次性做完？

确认后我会把 SQL migration 和前端 hooks 改造一起提交。

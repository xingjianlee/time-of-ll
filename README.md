# Time of Sunny & Felix · 我们的电子手账

> 一个为 Sunny Lu 与 Felix Lee 打造的浪漫情侣手账网站。

![preview](https://img.shields.io/badge/preview-live-ff6b6b?style=flat-square)

## 介绍

这是一个 React + TypeScript 构建的 SPA 网站，记录两人从 **2026.02.24** 开始的每一天。包含纪念日实时计时、拍立得照片墙、旅行时光轴和情侣心愿清单。

## 功能亮点

- 纪念日实时计时器：精确到秒，自适应天数位数
- 拍立得照片墙：点击翻转、双击放大，花瓣飘落动效
- 旅行时光轴：记录每一个去过的地方与瞬间
- 心愿清单：两人专属的双色气泡风格 TODO，支持完成记录（文字 + 照片）
- 爱心鼠标轨迹：划过屏幕时留下爱心印记

## 技术栈

| 技术 | 用途 |
|------|------|
| [TanStack Start](https://tanstack.com/start) | 全栈 React 框架 + 路由 |
| [Tailwind CSS v4](https://tailwindcss.com) | 样式 + 主题 token |
| [Framer Motion](https://www.framer.com/motion) | 动画与交互 |
| [Lucide React](https://lucide.dev) | 图标 |
| [shadcn/ui](https://ui.shadcn.com) | UI 组件库 |

## 本地开发

```bash
# 安装依赖
bun install

# 启动开发服务器
bun dev

# 构建生产版本
bun build

# 格式化代码
bun format
```

## 项目结构

```
src/
├── components/          # 页面组件
│   ├── AnniversaryCounter.tsx   # 纪念日实时计时
│   ├── CursorGlow.tsx           # 爱心鼠标轨迹
│   ├── Petals.tsx               # 花瓣飘落动效
│   ├── Polaroid.tsx             # 拍立得卡片
│   ├── PolaroidWall.tsx         # 拍立得照片墙
│   └── SiteHeader.tsx           # 站点导航
├── data/
│   └── photos.ts        # 照片墙数据源
├── routes/
│   ├── index.tsx        # 首页（计时器 + 照片墙）
│   ├── timeline.tsx     # 旅行时光轴
│   └── wishlist.tsx     # 心愿清单
└── styles.css           # 全局样式与设计 token
```

## 部署

项目基于 Cloudflare Workers 部署，使用 `wrangler.jsonc` 配置。

```bash
bun build
# 然后通过 wrangler 或 CI 部署
```

## License

Private — 属于 Sunny & Felix。

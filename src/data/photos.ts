import photo1 from "@/assets/photo-1.jpg";
import photo2 from "@/assets/photo-2.jpg";
import photo3 from "@/assets/photo-3.jpg";
import photo4 from "@/assets/photo-4.jpg";
import photo5 from "@/assets/photo-5.jpg";
import photo6 from "@/assets/photo-6.jpg";
import type { Photo } from "@/components/Polaroid";

export const photos: Photo[] = [
  {
    src: photo1,
    alt: "Cherry blossom street in Kyoto",
    caption: "Kyoto · 春",
    date: "2023.04.02",
    note: "你牵起我手的那一刻，整条街的樱花都在替我们鼓掌。",
    tilt: -4,
  },
  {
    src: photo2,
    alt: "Two coffee cups in Paris",
    caption: "Paris · 雨天",
    date: "2023.07.18",
    note: "外面下着雨，我们点了同一杯拿铁，你说这就是浪漫。",
    tilt: 3,
  },
  {
    src: photo3,
    alt: "Footprints on sunset beach",
    caption: "Okinawa · 日落",
    date: "2023.10.05",
    note: "脚印一深一浅，沿着海岸我们走了很久很久。",
    tilt: -2,
  },
  {
    src: photo4,
    alt: "Mountain cabin window",
    caption: "Hokkaido · 晨雾",
    date: "2024.01.12",
    note: "壁炉烧得正旺，你窝在我怀里说想这样过一辈子。",
    tilt: 4,
  },
  {
    src: photo5,
    alt: "Ferris wheel at night",
    caption: "Shanghai · 夜",
    date: "2024.05.20",
    note: "摩天轮停在最高点的时候，我把这一年攒下的话都说给你听。",
    tilt: -3,
  },
  {
    src: photo6,
    alt: "Picnic in spring meadow",
    caption: "Hangzhou · 春日野餐",
    date: "2024.04.14",
    note: "草莓很甜，柠檬汽水更甜，但你笑起来最甜。",
    tilt: 2,
  },
];

export interface TimelineEntry extends Photo {
  title: string;
  mood: string;
  story: string;
}

export const timeline: TimelineEntry[] = [
  {
    ...photos[0],
    title: "京都 · 樱花列车",
    mood: "心动",
    story:
      "我们追着樱花一路向北，从清水寺走到哲学之道。你说要把每一片掉到肩膀上的花瓣都收好，我说不用，因为我会把当时的你完整地记住。",
  },
  {
    ...photos[1],
    title: "巴黎 · 雨中咖啡",
    mood: "温柔",
    story:
      "雨大到让街道变成镜子。我们躲进一家小咖啡馆，分一块还烫嘴的可颂。窗外的世界很急，杯子里的世界很慢。",
  },
  {
    ...photos[5],
    title: "杭州 · 春日野餐",
    mood: "明亮",
    story:
      "草地软得像云。你把毯子铺得整整齐齐，又故意躺得乱七八糟。我假装生气，实际上偷偷拍了三十张你看天的样子。",
  },
  {
    ...photos[2],
    title: "冲绳 · 日落海岸",
    mood: "辽阔",
    story:
      "夕阳把海面烫成金箔。你提议比赛跑，我假装输给你。其实我只是想看你回头朝我笑的样子。",
  },
  {
    ...photos[4],
    title: "上海 · 摩天轮告白",
    mood: "勇敢",
    story:
      "灯光像撒了一地的星。摩天轮升到顶端时，我把准备了三天的话全说出口。你没有回答，只是把头靠在我肩上，那一刻我懂了。",
  },
  {
    ...photos[3],
    title: "北海道 · 雪夜壁炉",
    mood: "安心",
    story:
      "壁炉的火光在你脸上跳。窗外的雪一直下，我们什么都不做，就那样靠在一起，直到天亮。",
  },
];

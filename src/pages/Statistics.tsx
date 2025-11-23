import { motion } from "framer-motion";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const productivityData = [
  { date: "10.28", score: 3602 },
  { date: "10.31", score: 3850 },
  { date: "11.03", score: 4100 },
  { date: "11.06", score: 4300 },
  { date: "11.09", score: 4402 },
];

const weeklyReadingData = [
  { day: "월", hours: 2 },
  { day: "화", hours: 3 },
  { day: "수", hours: 5 },
  { day: "목", hours: 8 },
  { day: "금", hours: 4 },
];

const hormoneData = [
  { day: 7, estrogen: 30, fsh: 20, lh: 15, progesterone: 10 },
  { day: 14, estrogen: 80, fsh: 40, lh: 90, progesterone: 15 },
  { day: 21, estrogen: 60, fsh: 25, lh: 20, progesterone: 70 },
  { day: 28, estrogen: 25, fsh: 30, lh: 18, progesterone: 20 },
];

const Statistics = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon">
            <div className="w-6 h-6 flex flex-col gap-1">
              <div className="w-full h-0.5 bg-foreground" />
              <div className="w-full h-0.5 bg-foreground" />
              <div className="w-full h-0.5 bg-foreground" />
            </div>
          </Button>
          <h1 className="text-xl font-bold">통계</h1>
          <Button variant="ghost" size="icon">
            <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-foreground" />
              ))}
            </div>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-4 pb-3">
          <Button variant="secondary" size="sm" className="rounded-full">
            카테고리 ▼
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full">
            기간 ▼
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full">
            정렬 ▼
          </Button>
          <Button size="sm" className="rounded-full ml-auto bg-primary">
            <Star className="w-3 h-3 mr-1" />
            즐겨찾기
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Productivity Score */}
        <motion.div
          className="bg-card rounded-3xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-sm text-muted-foreground mb-2">성취도 점수</h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-bold">4,402</span>
            <span className="text-destructive flex items-center gap-1 text-sm">
              어제보다 <TrendingUp className="w-3 h-3" /> 269
            </span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={productivityData}>
              <defs>
                <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#productivityGradient)"
              />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Two Column Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Reading Time */}
          <motion.div
            className="bg-card rounded-3xl p-5 shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm text-muted-foreground mb-6">독서시간</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="12"
                  strokeDasharray={`${(89 / 100) * 352} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold">89</div>
                  <div className="text-xs text-muted-foreground">점<br />목표달성도</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div
            className="bg-card rounded-3xl p-5 shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm text-muted-foreground mb-2">7일 걸음수 평균</h3>
            <div className="relative w-20 h-20 mx-auto my-8">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeDasharray={`${(89 / 100) * 226} 226`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl font-bold">89</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">9,552 <span className="text-sm font-normal">보</span></div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Reading Chart */}
        <motion.div
          className="bg-card rounded-3xl p-5 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm text-muted-foreground">YouTube 사용시간</h3>
              <p className="text-3xl font-bold mt-1">4.2 <span className="text-base font-normal">시간</span></p>
            </div>
            <span className="text-xs text-destructive">목요일 최고</span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklyReadingData}>
              <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Hormone Cycle */}
        <motion.div
          className="bg-card rounded-3xl p-5 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">월경주기 호르몬변화</h3>
            <span className="text-xs text-muted-foreground">28일 주기</span>
          </div>
          <div className="flex gap-2 mb-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
              <span>에스트로젠</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#4ECDC4]" />
              <span>FSH</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#95E1D3]" />
              <span>LH</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#F38181]" />
              <span>프로게스테론</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-xs text-destructive">배란일</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={hormoneData}>
                <Line type="monotone" dataKey="estrogen" stroke="#FF6B6B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fsh" stroke="#4ECDC4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="lh" stroke="#95E1D3" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="progesterone" stroke="#F38181" strokeWidth={2} dot={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Statistics;

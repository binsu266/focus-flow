import { motion } from "framer-motion";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import { TrendingDown, Menu, LayoutGrid, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const productivityData = [
  { date: "10.28", score: 3602 },
  { date: "10.31", score: 3850 },
  { date: "11.03", score: 4100 },
  { date: "11.06", score: 4300 },
  { date: "11.09", score: 4402 },
];

const youtubeData = [
  { day: "월", hours: 2 },
  { day: "화", hours: 3 },
  { day: "수", hours: 5 },
  { day: "목", hours: 8 },
  { day: "금", hours: 4 },
  { day: "토", hours: 3 },
  { day: "일", hours: 2 },
];

const hormoneData = [
  { day: 7, estrogen: 30, fsh: 20, lh: 15, progesterone: 10 },
  { day: 14, estrogen: 80, fsh: 40, lh: 90, progesterone: 15 },
  { day: 21, estrogen: 60, fsh: 25, lh: 20, progesterone: 70 },
  { day: 28, estrogen: 25, fsh: 30, lh: 18, progesterone: 20 },
];

const Statistics = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--stats-bg))] pb-24">
      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-5 bg-[hsl(var(--stats-bg))]">
        <Button variant="ghost" size="icon" className="text-[hsl(var(--stats-text-primary))]">
          <Menu className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-[hsl(var(--stats-text-primary))]">통계</h1>
        <Button variant="ghost" size="icon" className="text-[hsl(var(--stats-text-primary))]">
          <LayoutGrid className="w-5 h-5" />
        </Button>
      </header>

      {/* Filter Buttons */}
      <div className="flex gap-3 px-4 py-4 overflow-x-auto">
        <Button 
          className="h-11 px-5 rounded-[22px] text-[15px] font-medium bg-[hsl(var(--stats-filter-inactive))] text-[hsl(var(--stats-filter-inactive-text))] hover:bg-[hsl(var(--stats-filter-inactive))]"
        >
          카테고리 ▼
        </Button>
        <Button 
          className="h-11 px-5 rounded-[22px] text-[15px] font-medium bg-[hsl(var(--stats-filter-inactive))] text-[hsl(var(--stats-filter-inactive-text))] hover:bg-[hsl(var(--stats-filter-inactive))]"
        >
          기간 ▼
        </Button>
        <Button 
          className="h-11 px-5 rounded-[22px] text-[15px] font-medium bg-[hsl(var(--stats-filter-inactive))] text-[hsl(var(--stats-filter-inactive-text))] hover:bg-[hsl(var(--stats-filter-inactive))]"
        >
          정렬 ▼
        </Button>
        <Button 
          className="h-11 px-5 rounded-[22px] text-[15px] font-medium bg-primary text-white hover:bg-primary/90 ml-auto"
        >
          <Star className="w-4 h-4 mr-1.5" />
          즐겨찾기
        </Button>
      </div>

      <div className="px-4 space-y-4">
        {/* Achievement Score Card */}
        <motion.div
          className="w-full h-[240px] rounded-[20px] bg-card p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-0.5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-[15px] font-medium text-[hsl(var(--stats-text-secondary))] mb-3">성취도 점수</h3>
          <div className="flex items-baseline">
            <span className="text-[56px] font-bold text-[hsl(var(--stats-text-primary))] leading-none">4,402</span>
            <span className="text-[16px] font-medium text-[hsl(var(--stats-accent))] ml-2 flex items-center gap-1">
              <TrendingDown className="w-4 h-4" /> 269
            </span>
          </div>
          <div className="h-[120px] mt-5">
            <ResponsiveContainer width="100%" height="100%">
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
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--stats-text-tertiary))' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Two Column Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Reading Time */}
          <motion.div
            className="h-[200px] rounded-[20px] bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-0.5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-[14px] font-medium text-[hsl(var(--stats-text-secondary))] mb-4">독서시간</h3>
            <div className="relative w-[120px] h-[120px] mx-auto">
              <svg className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="12"
                  strokeDasharray={`${(89 / 100) * 339} 339`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[48px] font-bold text-[hsl(var(--stats-text-primary))] leading-none">89</div>
                  <div className="text-[12px] font-medium text-[hsl(var(--stats-text-secondary))] mt-1">목표달성도</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div
            className="h-[200px] rounded-[20px] bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-0.5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-[14px] font-medium text-[hsl(var(--stats-text-secondary))] mb-4">7일 걸음수 평균</h3>
            <div className="flex flex-col items-center justify-center h-[calc(100%-40px)]">
              <div className="text-[36px] font-bold text-[hsl(var(--stats-text-primary))] leading-none">
                9,552
              </div>
              <div className="text-[13px] text-[hsl(var(--stats-text-secondary))] mt-2">보</div>
            </div>
          </motion.div>
        </div>

        {/* YouTube Usage Card */}
        <motion.div
          className="w-full h-[280px] rounded-[20px] bg-card p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-0.5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-[15px] font-medium text-[hsl(var(--stats-text-secondary))] mb-2">YouTube 사용시간</h3>
          <div className="flex items-baseline">
            <span className="text-[48px] font-bold text-[hsl(var(--stats-text-primary))]">4.2</span>
            <span className="text-[20px] font-medium text-[hsl(var(--stats-text-secondary))] ml-1">시간</span>
          </div>
          <p className="text-[13px] font-medium text-[hsl(var(--stats-accent))] mt-2">권장시간보다 많아요</p>
          <div className="h-[140px] mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={youtubeData}>
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 13, fill: 'hsl(var(--stats-text-tertiary))' }} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Hormone Cycle Card */}
        <motion.div
          className="w-full h-[320px] rounded-[20px] bg-card p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 hover:-translate-y-0.5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-[15px] font-medium text-[hsl(var(--stats-text-secondary))]">월경주기 호르몬변화</h3>
          <p className="text-[13px] text-[hsl(var(--stats-text-tertiary))] mt-1">28일 주기</p>
          
          {/* Legend */}
          <div className="flex gap-4 mt-4 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-estrogen))]" />
              <span className="text-[12px] text-[hsl(var(--stats-text-secondary))]">에스트로젠</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-fsh))]" />
              <span className="text-[12px] text-[hsl(var(--stats-text-secondary))]">FSH</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-lh))]" />
              <span className="text-[12px] text-[hsl(var(--stats-text-secondary))]">LH</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[hsl(var(--chart-progesterone))]" />
              <span className="text-[12px] text-[hsl(var(--stats-text-secondary))]">프로게스테론</span>
            </div>
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hormoneData}>
                <Line type="monotone" dataKey="estrogen" stroke="hsl(var(--chart-estrogen))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fsh" stroke="hsl(var(--chart-fsh))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="lh" stroke="hsl(var(--chart-lh))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="progesterone" stroke="hsl(var(--chart-progesterone))" strokeWidth={2} dot={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--stats-text-tertiary))' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Statistics;

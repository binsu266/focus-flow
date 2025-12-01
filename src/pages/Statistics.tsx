import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Menu, MoreHorizontal, Footprints } from "lucide-react";
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
  { day: "화", hours: 2.5 },
  { day: "수", hours: 3 },
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
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      {/* Header */}
      <header className="h-[60px] flex items-center justify-between px-5">
        <Button variant="ghost" size="icon" className="text-[#1A1A1A]">
          <Menu className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">통계</h1>
        <Button variant="ghost" size="icon" className="text-[#1A1A1A]">
          <MoreHorizontal className="w-6 h-6" />
        </Button>
      </header>

      {/* Filter Buttons */}
      <div className="flex gap-3 px-4 py-4 overflow-x-auto">
        <Button className="h-11 px-5 rounded-[22px] text-[15px] font-medium bg-[#F0F0F0] text-[#6B6B6B] hover:bg-[#E8E8E8] border border-[#E0E0E0]">
          카테고리 ▼
        </Button>
        <Button className="h-11 px-5 rounded-[22px] text-[15px] font-medium bg-[#F0F0F0] text-[#6B6B6B] hover:bg-[#E8E8E8] border border-[#E0E0E0]">
          기간 ▼
        </Button>
        <Button className="h-11 px-5 rounded-[22px] text-[15px] font-medium bg-[#F0F0F0] text-[#6B6B6B] hover:bg-[#E8E8E8] border border-[#E0E0E0]">
          정렬 ▼
        </Button>
        <Button className="h-11 px-5 rounded-[22px] text-[15px] font-medium bg-[#5C5C5C] text-white hover:bg-[#4A4A4A]">
          ★ 즐겨찾기
        </Button>
      </div>

      <div className="px-4 space-y-3">
        {/* Achievement Score Card */}
        <motion.div
          className="w-full h-[280px] rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-[14px] font-medium text-[#6B6B6B] mb-2 tracking-[-0.2px]">성취도 점수</h3>
          <div className="flex items-center gap-3">
            <span className="text-[52px] font-bold text-[#1A1A1A] leading-none tracking-[-1.5px]">4,402</span>
            <span className="px-3 py-1.5 rounded-full bg-[#FFE8E5] text-[#FF9B94] text-[13px] font-medium">
              어제보다 ↑ 269
            </span>
          </div>
          <div className="h-[180px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#88C9A1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#88C9A1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <YAxis 
                  domain={[3600, 4500]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#ABABAB' }}
                  tickFormatter={(value) => value.toLocaleString()}
                  orientation="right"
                  width={45}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#88C9A1"
                  strokeWidth={2.5}
                  fill="url(#productivityGradient)"
                  dot={{ fill: '#88C9A1', strokeWidth: 0, r: 4 }}
                  activeDot={{ fill: '#FF9B94', strokeWidth: 0, r: 6 }}
                />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#ABABAB' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Two Column Cards - Reading & Steps */}
        <div className="grid grid-cols-2 gap-3">
          {/* Reading Time */}
          <motion.div
            className="h-[180px] rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-[13px] font-medium text-[#6B6B6B] tracking-[-0.2px]">독서시간</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-[110px] h-[110px]">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="55" cy="55" r="48" fill="none" stroke="#E8E8E8" strokeWidth="10" />
                  <circle
                    cx="55"
                    cy="55"
                    r="48"
                    fill="none"
                    stroke="#88C9A1"
                    strokeWidth="10"
                    strokeDasharray={`${(89 / 100) * 301.6} 301.6`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="flex items-baseline">
                    <span className="text-[40px] font-bold text-[#1A1A1A] leading-none tracking-[-1px]">89</span>
                    <span className="text-[16px] font-medium text-[#6B6B6B] ml-0.5">점</span>
                  </div>
                  <span className="text-[11px] font-medium text-[#6B6B6B] mt-1">목표달성도</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Steps */}
          <motion.div
            className="h-[180px] rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-[3px] border-[#88C9A1] flex items-center justify-center mb-3">
                <Footprints className="w-7 h-7 text-[#88C9A1]" />
              </div>
              <span className="text-[12px] text-[#6B6B6B] mb-1">7일 걸음수 평균</span>
              <div className="flex items-baseline">
                <span className="text-[36px] font-bold text-[#1A1A1A] leading-none tracking-[-1px]">9,552</span>
                <span className="text-[14px] font-medium text-[#6B6B6B] ml-1">보</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Two Column Cards - YouTube & Hormone */}
        <div className="grid grid-cols-2 gap-3">
          {/* YouTube Usage Card */}
          <motion.div
            className="h-[200px] rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-[13px] font-medium text-[#6B6B6B] tracking-[-0.2px]">YouTube 사용시간</h3>
            <div className="flex items-baseline mt-1">
              <span className="text-[36px] font-bold text-[#1A1A1A] leading-none tracking-[-1px]">4.2</span>
              <span className="text-[14px] font-medium text-[#6B6B6B] ml-1">시간</span>
            </div>
            <p className="text-[12px] font-medium text-[#FF9B94] mt-1">목요일 최고</p>
            <div className="flex-1 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={youtubeData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <Bar dataKey="hours" fill="#88C9A1" radius={[4, 4, 0, 0]} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#ABABAB' }} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Hormone Cycle Card */}
          <motion.div
            className="h-[200px] rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[13px] font-medium text-[#6B6B6B] tracking-[-0.2px]">월경주기 호르몬변화</h3>
                <p className="text-[11px] text-[#ABABAB] mt-0.5">28일 주기</p>
              </div>
              <div className="flex flex-col gap-0.5 text-[9px]">
                <div className="flex items-center gap-1">
                  <span className="text-[#6B6B6B]">에스트로겐</span>
                  <div className="w-3 h-[2px] bg-[#FF8A80]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#6B6B6B]">FSH</span>
                  <div className="w-3 h-[2px] bg-[#FFB4A8]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#6B6B6B]">LH</span>
                  <div className="w-3 h-[2px] bg-[#6DD4D4]" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#6B6B6B]">프로게스테론</span>
                  <div className="w-3 h-[2px] bg-[#88C9A1]" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 mt-2 relative">
              {/* 배란일 label */}
              <div className="absolute top-0 left-[45%] z-10 px-1.5 py-0.5 bg-[#FFF8E1] rounded text-[8px] text-[#F9A825]">
                배란일
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hormoneData} margin={{ top: 15, right: 5, left: 0, bottom: 0 }}>
                  <Line type="monotone" dataKey="estrogen" stroke="#FF8A80" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="fsh" stroke="#FFB4A8" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="lh" stroke="#6DD4D4" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="progesterone" stroke="#88C9A1" strokeWidth={1.5} dot={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#ABABAB' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Bottom Two Column Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* 경제신문 읽기 */}
          <motion.div
            className="h-[100px] rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-[13px] font-medium text-[#6B6B6B] tracking-[-0.2px] mb-3">경제신문 읽기</h3>
            <div className="flex gap-1">
              {[1, 1, 1, 1, 1, 1, 0.5, 0.3, 0.3].map((opacity, i) => (
                <div 
                  key={i} 
                  className="flex-1 h-6 rounded-sm" 
                  style={{ backgroundColor: `rgba(136, 201, 161, ${opacity})` }}
                />
              ))}
            </div>
          </motion.div>

          {/* 수면 기록 */}
          <motion.div
            className="h-[100px] rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-[13px] font-medium text-[#6B6B6B] tracking-[-0.2px] mb-2">수면 기록</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF8E1] flex items-center justify-center">
                <span className="text-xl">🌙</span>
              </div>
              <div>
                <p className="text-[11px] text-[#6B6B6B]">평균 수면시간</p>
                <div className="flex items-baseline">
                  <span className="text-[24px] font-bold text-[#1A1A1A] leading-none">7.5</span>
                  <span className="text-[12px] text-[#6B6B6B] ml-1">시간</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

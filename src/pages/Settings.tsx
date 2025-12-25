import { useState } from "react";
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Paintbrush,
  Calendar,
  Timer,
  BarChart3,
  Tags,
  Plus,
  Database,
  Upload,
  Trash2,
  Info,
  HelpCircle,
  MessageSquare,
  Star,
  FileText,
  ScrollText,
  FlaskConical,
  Bug,
  ChevronRight
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
  danger?: boolean;
}

const SettingItem = ({ 
  icon, 
  title, 
  description, 
  onClick, 
  rightElement,
  showArrow = false,
  danger = false
}: SettingItemProps) => (
  <div 
    className={`flex items-center gap-4 px-4 py-4 min-h-[56px] ${onClick ? 'cursor-pointer active:bg-muted/50 transition-colors' : ''}`}
    onClick={onClick}
  >
    <div className={`${danger ? 'text-destructive' : 'text-primary'}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-base font-medium ${danger ? 'text-destructive' : 'text-foreground'}`}>
        {title}
      </p>
      {description && (
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      )}
    </div>
    {rightElement}
    {showArrow && (
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    )}
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="px-4 py-3 bg-muted/30">
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
      {title}
    </h3>
  </div>
);

const Settings = () => {
  // Notification settings
  const [todoNotification, setTodoNotification] = useState(true);
  const [scheduleNotification, setScheduleNotification] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  // Display settings
  const [theme, setTheme] = useState("system");
  const [weekendHighlight, setWeekendHighlight] = useState(true);
  const [lunarCalendar, setLunarCalendar] = useState(false);
  const [weekStart, setWeekStart] = useState("sunday");

  // Time tracking settings
  const [timeUnit, setTimeUnit] = useState("30min");
  const [autoTracking, setAutoTracking] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(true);

  // Advanced settings
  const [betaFeatures, setBetaFeatures] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const handleNavigation = (screen: string) => {
    toast.info(`${screen} 화면으로 이동합니다`, {
      description: "곧 출시될 기능입니다"
    });
  };

  const handleDataReset = () => {
    toast.success("모든 데이터가 초기화되었습니다");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center justify-center h-14">
          <h1 className="text-lg font-semibold">설정</h1>
        </div>
      </div>

      <div className="divide-y divide-border">
        {/* 1. 프로필 및 계정 */}
        <section>
          <SectionHeader title="프로필 및 계정" />
          <div className="bg-card">
            <SettingItem
              icon={<User className="w-5 h-5" />}
              title="프로필"
              description="이름, 프로필 사진 설정"
              onClick={() => handleNavigation("프로필 편집")}
              showArrow
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<Lock className="w-5 h-5" />}
              title="계정 관리"
              description="로그인, 비밀번호 변경"
              onClick={() => handleNavigation("계정 설정")}
              showArrow
            />
          </div>
        </section>

        {/* 2. 알림 설정 */}
        <section>
          <SectionHeader title="알림 설정" />
          <div className="bg-card">
            <SettingItem
              icon={<Bell className="w-5 h-5" />}
              title="할 일 알림"
              description="예정된 할 일 알림 받기"
              rightElement={
                <Switch 
                  checked={todoNotification} 
                  onCheckedChange={setTodoNotification}
                />
              }
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<Bell className="w-5 h-5" />}
              title="일정 시작 알림"
              description="일정 시작 10분 전 알림"
              rightElement={
                <Switch 
                  checked={scheduleNotification} 
                  onCheckedChange={setScheduleNotification}
                />
              }
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<Bell className="w-5 h-5" />}
              title="일일 요약 알림"
              description="매일 저녁 9시 오늘 정리/내일 미리보기"
              rightElement={
                <Switch 
                  checked={dailySummary} 
                  onCheckedChange={setDailySummary}
                />
              }
            />
          </div>
        </section>

        {/* 3. 화면 및 테마 */}
        <section>
          <SectionHeader title="화면 및 테마" />
          <div className="bg-card">
            <SettingItem
              icon={<Palette className="w-5 h-5" />}
              title="테마 설정"
              rightElement={
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">라이트</SelectItem>
                    <SelectItem value="dark">다크</SelectItem>
                    <SelectItem value="system">시스템</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<Paintbrush className="w-5 h-5" />}
              title="색상 테마"
              description="앱 전체 색상 테마 변경"
              onClick={() => handleNavigation("색상 선택")}
              showArrow
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<Calendar className="w-5 h-5" />}
              title="주말 강조 표시"
              rightElement={
                <Switch 
                  checked={weekendHighlight} 
                  onCheckedChange={setWeekendHighlight}
                />
              }
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<Calendar className="w-5 h-5" />}
              title="음력 표시"
              rightElement={
                <Switch 
                  checked={lunarCalendar} 
                  onCheckedChange={setLunarCalendar}
                />
              }
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<Calendar className="w-5 h-5" />}
              title="주 시작 요일"
              rightElement={
                <Select value={weekStart} onValueChange={setWeekStart}>
                  <SelectTrigger className="w-24 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">일요일</SelectItem>
                    <SelectItem value="monday">월요일</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
          </div>
        </section>

        {/* 4. 시간 기록 설정 */}
        <section>
          <SectionHeader title="시간 기록 설정" />
          <div className="bg-card">
            <SettingItem
              icon={<Timer className="w-5 h-5" />}
              title="기본 시간 단위"
              description="새 타임블록 생성 시 기본 단위"
              rightElement={
                <Select value={timeUnit} onValueChange={setTimeUnit}>
                  <SelectTrigger className="w-24 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15min">15분</SelectItem>
                    <SelectItem value="30min">30분</SelectItem>
                    <SelectItem value="1hour">1시간</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<Timer className="w-5 h-5" />}
              title="자동 시간 추적"
              description="현재 활동 자동 기록 (실험적)"
              rightElement={
                <Switch 
                  checked={autoTracking} 
                  onCheckedChange={setAutoTracking}
                />
              }
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<BarChart3 className="w-5 h-5" />}
              title="주간 리포트"
              rightElement={
                <Switch 
                  checked={weeklyReport} 
                  onCheckedChange={setWeeklyReport}
                />
              }
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<BarChart3 className="w-5 h-5" />}
              title="월간 리포트"
              rightElement={
                <Switch 
                  checked={monthlyReport} 
                  onCheckedChange={setMonthlyReport}
                />
              }
            />
          </div>
        </section>

        {/* 5. 카테고리 관리 */}
        <section>
          <SectionHeader title="카테고리 관리" />
          <div className="bg-card">
            <SettingItem
              icon={<Tags className="w-5 h-5" />}
              title="카테고리 편집"
              description="학업활동, 근로활동, 대외활동, 생활/건강"
              onClick={() => handleNavigation("카테고리 편집")}
              showArrow
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<Plus className="w-5 h-5" />}
              title="새 카테고리 추가"
              description="최대 8개까지 추가 가능"
              onClick={() => handleNavigation("카테고리 추가")}
              showArrow
            />
          </div>
        </section>

        {/* 6. 데이터 관리 */}
        <section>
          <SectionHeader title="데이터 관리" />
          <div className="bg-card">
            <SettingItem
              icon={<Database className="w-5 h-5" />}
              title="데이터 백업"
              description="클라우드에 데이터 백업하기"
              onClick={() => handleNavigation("데이터 백업")}
              showArrow
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<Upload className="w-5 h-5" />}
              title="내보내기"
              description="할 일, 시간 기록을 CSV/PDF로 내보내기"
              onClick={() => handleNavigation("내보내기")}
              showArrow
            />
            <Separator className="ml-14" />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div>
                  <SettingItem
                    icon={<Trash2 className="w-5 h-5" />}
                    title="데이터 초기화"
                    description="모든 데이터 삭제 (주의)"
                    danger
                    showArrow
                  />
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 초기화하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 작업은 되돌릴 수 없습니다. 모든 할 일, 시간 기록, 설정이 영구적으로 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDataReset}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    초기화
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        {/* 7. 앱 정보 및 지원 */}
        <section>
          <SectionHeader title="앱 정보 및 지원" />
          <div className="bg-card">
            <SettingItem
              icon={<Info className="w-5 h-5" />}
              title="앱 정보"
              description="버전 1.0.0"
              onClick={() => handleNavigation("앱 정보")}
              showArrow
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<HelpCircle className="w-5 h-5" />}
              title="도움말 및 튜토리얼"
              description="앱 사용법 다시 보기"
              onClick={() => handleNavigation("도움말")}
              showArrow
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<MessageSquare className="w-5 h-5" />}
              title="피드백 보내기"
              description="개선 아이디어나 버그 신고"
              onClick={() => handleNavigation("피드백")}
              showArrow
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<Star className="w-5 h-5" />}
              title="앱 평가하기"
              description="스토어에서 평가 남기기"
              onClick={() => handleNavigation("앱 평가")}
              showArrow
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<FileText className="w-5 h-5" />}
              title="개인정보 처리방침"
              onClick={() => handleNavigation("개인정보 처리방침")}
              showArrow
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<ScrollText className="w-5 h-5" />}
              title="이용약관"
              onClick={() => handleNavigation("이용약관")}
              showArrow
            />
          </div>
        </section>

        {/* 8. 고급 설정 */}
        <section>
          <SectionHeader title="고급 설정" />
          <div className="bg-card">
            <SettingItem
              icon={<FlaskConical className="w-5 h-5" />}
              title="베타 기능 사용"
              description="새로운 기능 미리 체험"
              rightElement={
                <Switch 
                  checked={betaFeatures} 
                  onCheckedChange={setBetaFeatures}
                />
              }
            />
            <Separator className="ml-14" />
            <SettingItem
              icon={<Bug className="w-5 h-5" />}
              title="디버그 모드"
              description="개발자 옵션"
              rightElement={
                <Switch 
                  checked={debugMode} 
                  onCheckedChange={setDebugMode}
                />
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;

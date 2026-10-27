import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Filter,
  Plus,
  Check,
  Bookmark,
  Layers,
  Sparkles,
  ChevronRight,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { CALISTHENICS_EXERCISES } from '../../data/calisthenicsExercises';
import { CalisthenicsExercise, ExerciseGroup, EquipmentType } from '../../types/calisthenics';
import { ExerciseDetailDrawer } from './ExerciseDetailDrawer';
import { ProgressionChainModal } from './ProgressionChainModal';
import { CustomExerciseModal } from './CustomExerciseModal';
import { useApp } from '../../context/AppContext';
import { matchesVietnameseSearch } from '../../utils/vietnamese';

interface ExerciseLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercises?: (exercises: CalisthenicsExercise[]) => void;
  selectedExerciseIds?: string[];
  mode?: 'browse' | 'picker'; // 'picker' when adding to custom workout
}

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectExercises,
  selectedExerciseIds = [],
  mode = 'browse',
}) => {
  const { profile, savedWorkoutIds } = useApp();

  const [activeGroup, setActiveGroup] = useState<ExerciseGroup | 'tat_ca'>('tat_ca');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<'home_only' | 'all' | 'pullup' | 'dip'>('home_only');
  const [lowImpactOnly, setLowImpactOnly] = useState(false);
  const [fitForMeOnly, setFitForMeOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['pushup_standard', 'squat_bodyweight']);

  // Modal sub-views
  const [detailExercise, setDetailExercise] = useState<CalisthenicsExercise | null>(null);
  const [isLadderOpen, setIsLadderOpen] = useState(false);
  const [isCustomExOpen, setIsCustomExOpen] = useState(false);
  const [localCustomExercises, setLocalCustomExercises] = useState<CalisthenicsExercise[]>([]);

  // Selected for batch add
  const [batchSelected, setBatchSelected] = useState<string[]>(selectedExerciseIds);

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const toggleBatchSelect = (ex: CalisthenicsExercise) => {
    setBatchSelected(prev =>
      prev.includes(ex.id) ? prev.filter(x => x !== ex.id) : [...prev, ex.id]
    );
  };

  const groups: { id: ExerciseGroup | 'tat_ca'; label: string }[] = [
    { id: 'tat_ca', label: 'Tất cả' },
    { id: 'day_ngang', label: 'Đẩy ngang' },
    { id: 'day_doc', label: 'Đẩy dọc' },
    { id: 'day_gia_do', label: 'Dips xà' },
    { id: 'keo', label: 'Kéo lưng' },
    { id: 'chan', label: 'Chân' },
    { id: 'mong_dui_sau', label: 'Mông' },
    { id: 'core', label: 'Core bụng' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'plyometric', label: 'Plyo bật' },
    { id: 'ky_nang', label: 'Kỹ năng' },
    { id: 'khoi_dong', label: 'Khởi động' },
    { id: 'gian_co', label: 'Giãn cơ' },
  ];

  const allExercises = useMemo(() => {
    return [...localCustomExercises, ...CALISTHENICS_EXERCISES];
  }, [localCustomExercises]);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return allExercises.filter(ex => {
      // 1. Group filter
      if (activeGroup !== 'tat_ca' && ex.group !== activeGroup) return false;

      // 2. Equipment filter (Default: 'home_only' = none + household)
      if (equipmentFilter === 'home_only') {
        if (ex.equipment !== 'none' && ex.equipment !== 'household') return false;
      } else if (equipmentFilter === 'pullup') {
        if (ex.equipment !== 'pullup_bar') return false;
      } else if (equipmentFilter === 'dip') {
        if (ex.equipment !== 'dip_bars') return false;
      }

      // 3. Level filter
      if (selectedLevel !== 'all' && ex.level !== selectedLevel) return false;

      // 4. Low impact filter
      if (lowImpactOnly && ex.jointImpact !== 'low') return false;

      // 5. "Fit for me" filter (PAR-Q check: hides exercises that conflict with health condition or level)
      if (fitForMeOnly) {
        if (!profile.parQPassed && ex.healthWarnings.includes('knee')) return false;
        if (profile.fitnessLevel === 'moi_bat_dau' && ex.level >= 4) return false;
      }

      // 6. Accent-insensitive search
      if (searchQuery.trim()) {
        const matchesName = matchesVietnameseSearch(ex.nameVi, searchQuery);
        const matchesEn = ex.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAlias = ex.aliases.some(a => matchesVietnameseSearch(a, searchQuery));
        const matchesMuscle = matchesVietnameseSearch(ex.primaryMuscle, searchQuery);
        if (!matchesName && !matchesEn && !matchesAlias && !matchesMuscle) return false;
      }

      return true;
    });
  }, [allExercises, activeGroup, equipmentFilter, selectedLevel, lowImpactOnly, fitForMeOnly, searchQuery, profile]);

  if (!isOpen) return null;

  const handleConfirmBatch = () => {
    if (!onSelectExercises) return;
    const selectedList = allExercises.filter(e => batchSelected.includes(e.id));
    onSelectExercises(selectedList);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Thư viện bài tập Calisthenics"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-fade-in"
    >
      <div className="w-full max-w-[440px] h-full sm:h-[92vh] bg-[#121316] border sm:border-[#383A3F] sm:rounded-[36px] overflow-hidden flex flex-col shadow-2xl">
        {/* Top Header */}
        <div className="p-4 border-b border-[#2A2B2E] bg-[#18191C] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4FF4F]"></span>
              <h2 className="text-base font-black text-white">Thư Viện Calisthenics</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A2B2E] text-[#9A9CA3] font-bold font-tabular">
                {filteredExercises.length} bài
              </span>
            </div>
            <p className="text-[11px] text-[#9A9CA3]">Chọn bài tập phù hợp với thể trạng của bạn</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLadderOpen(true)}
              aria-label="Xem bậc thang tiến triển"
              className="px-2.5 py-1 rounded-full bg-[#2A2B2E] text-[#D4FF4F] hover:bg-[#383A3F] text-[11px] font-bold flex items-center gap-1 border border-[#383A3F]"
            >
              <Layers size={13} />
              <span>Tiến triển</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Đóng thư viện"
              className="w-8 h-8 rounded-full bg-[#2A2B2E] text-[#9A9CA3] hover:text-white flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-[#18191C] border-b border-[#2A2B2E] space-y-2">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9CA3]" />
            <input
              type="text"
              placeholder="Tìm bài (vd: hit dat, squat, plank, nguc, bung...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121316] border border-[#2A2B2E] rounded-full text-xs text-white placeholder-[#6B6D75] focus:outline-none focus:border-[#D4FF4F]"
            />
          </div>

          {/* Filter Chips Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {/* Equipment Filter */}
            <select
              value={equipmentFilter}
              onChange={e => setEquipmentFilter(e.target.value as any)}
              className="px-2.5 py-1 rounded-full bg-[#2A2B2E] border border-[#383A3F] text-[#D4FF4F] text-[11px] font-bold focus:outline-none cursor-pointer"
            >
              <option value="home_only" className="bg-[#1E1F22] text-white">🏠 Tại nhà (Không dụng cụ + đồ nhà)</option>
              <option value="all" className="bg-[#1E1F22] text-white">Tất cả dụng cụ</option>
              <option value="pullup" className="bg-[#1E1F22] text-white">Chỉ bài có thanh xà</option>
              <option value="dip" className="bg-[#1E1F22] text-white">Chỉ bài có xà kép</option>
            </select>

            {/* Low Impact Toggle */}
            <button
              onClick={() => setLowImpactOnly(!lowImpactOnly)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                lowImpactOnly
                  ? 'bg-[#D4FF4F] text-[#121316] border-[#D4FF4F]'
                  : 'bg-[#2A2B2E] text-[#9A9CA3] border-[#383A3F]'
              }`}
            >
              Ít tác động (Không nhảy)
            </button>

            {/* Fit For Me Toggle */}
            <button
              onClick={() => setFitForMeOnly(!fitForMeOnly)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 ${
                fitForMeOnly
                  ? 'bg-[#D4FF4F] text-[#121316] border-[#D4FF4F]'
                  : 'bg-[#2A2B2E] text-[#9A9CA3] border-[#383A3F]'
              }`}
            >
              <ShieldCheck size={12} />
              <span>Phù hợp với tôi</span>
            </button>
          </div>
        </div>

        {/* Group Tabs (Đẩy, Kéo, Chân, Mông, Core, Cardio, Plyo...) */}
        <div className="flex gap-1.5 p-2 bg-[#121316] overflow-x-auto no-scrollbar border-b border-[#2A2B2E]">
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeGroup === g.id
                  ? 'bg-[#D4FF4F] text-[#121316] shadow-sm'
                  : 'bg-[#1E1F22] text-[#9A9CA3] hover:text-white border border-[#2A2B2E]'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Exercises Grid */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          <div className="grid grid-cols-2 gap-2.5">
            {filteredExercises.map(ex => {
              const isFav = favoriteIds.includes(ex.id);
              const isSelected = batchSelected.includes(ex.id);

              return (
                <div
                  key={ex.id}
                  onClick={() => setDetailExercise(ex)}
                  className={`p-3 rounded-[22px] border transition-all flex flex-col justify-between cursor-pointer group active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#2A2B2E] border-[#D4FF4F] shadow-[0_0_12px_rgba(212,255,79,0.2)]'
                      : 'bg-[#1E1F22] border-[#2A2B2E] hover:border-[#383A3F]'
                  }`}
                >
                  <div>
                    {/* Top Row: Level & Bookmark */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#121316] text-[#D4FF4F] font-bold">
                        Cấp {ex.level}
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleFavorite(ex.id);
                        }}
                        aria-label="Lưu yêu thích"
                        className="w-6 h-6 rounded-full bg-[#121316] text-[#9A9CA3] hover:text-[#D4FF4F] flex items-center justify-center transition-colors"
                      >
                        <Bookmark size={11} fill={isFav ? '#D4FF4F' : 'none'} className={isFav ? 'text-[#D4FF4F]' : ''} />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-[#D4FF4F] transition-colors">
                      {ex.nameVi}
                    </h4>
                    <span className="text-[10px] text-[#9A9CA3] block mt-0.5 truncate">
                      {ex.primaryMuscle}
                    </span>
                  </div>

                  {/* Bottom Row: Quick Select / Add button */}
                  <div className="mt-3 pt-2 border-t border-[#2A2B2E] flex items-center justify-between">
                    <span className="text-[10px] text-[#9A9CA3]">
                      {ex.measurementType === 'reps' ? 'Reps' : ex.measurementType === 'seconds' ? 'Giây' : 'Mỗi bên'}
                    </span>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleBatchSelect(ex);
                      }}
                      aria-label={`Chọn bài ${ex.nameVi}`}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#D4FF4F] text-[#121316]'
                          : 'bg-[#2A2B2E] text-[#9A9CA3] hover:text-white hover:bg-[#383A3F]'
                      }`}
                    >
                      {isSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Custom Exercise Card */}
          <div
            onClick={() => setIsCustomExOpen(true)}
            className="p-3.5 rounded-[22px] bg-[#18191C] border border-dashed border-[#383A3F] hover:border-[#D4FF4F] text-center cursor-pointer transition-all mt-3"
          >
            <span className="text-xs font-bold text-[#D4FF4F] flex items-center justify-center gap-1.5">
              <Plus size={14} /> Thêm bài tập riêng của bạn
            </span>
            <p className="text-[10px] text-[#9A9CA3] mt-0.5">Tự đặt tên, nhóm cơ, kiểu đo và lưu vào thư viện</p>
          </div>
        </div>

        {/* Bottom Bar if Batch Selected */}
        {batchSelected.length > 0 && onSelectExercises && (
          <div className="p-3.5 bg-[#18191C] border-t border-[#2A2B2E] flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white block">
                Đã chọn <strong className="text-[#D4FF4F] font-tabular">{batchSelected.length} bài</strong>
              </span>
              <span className="text-[10px] text-[#9A9CA3]">Sẵn sàng ghép vào buổi tập</span>
            </div>

            <button
              onClick={handleConfirmBatch}
              className="py-3 px-5 rounded-full bg-[#D4FF4F] text-[#121316] font-extrabold text-xs flex items-center gap-1.5 shadow-md hover:bg-[#C5F23E] cursor-pointer"
            >
              <span>Thêm vào buổi tập</span>
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>

      {/* Sub-modals */}
      <ExerciseDetailDrawer
        exercise={detailExercise}
        onClose={() => setDetailExercise(null)}
        onSelectForWorkout={ex => {
          toggleBatchSelect(ex);
          setDetailExercise(null);
        }}
        isSelected={detailExercise ? batchSelected.includes(detailExercise.id) : false}
      />

      <ProgressionChainModal
        isOpen={isLadderOpen}
        onClose={() => setIsLadderOpen(false)}
        onSelectExercise={ex => setDetailExercise(ex)}
      />

      <CustomExerciseModal
        isOpen={isCustomExOpen}
        onClose={() => setIsCustomExOpen(false)}
        onSaveExercise={newEx => {
          setLocalCustomExercises(prev => [newEx, ...prev]);
          toggleBatchSelect(newEx);
        }}
      />
    </div>
  );
};

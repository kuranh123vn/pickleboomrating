import { useState, useEffect, FormEvent } from 'react';
import { 
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate
} from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Trash2, 
  Edit2, 
  Search,
  X,
  Filter,
  ChevronRight,
  Info,
  Award,
  AlertCircle,
  Swords,
  CheckCircle2,
  Calendar,
  History,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Member {
  id: number;
  name: string;
  gender: 'Nam' | 'Nữ';
  tier: string;
  base_rating: number;
  current_rating: number;
}

const TIER_RATINGS: Record<string, Record<string, number>> = {
  'Nam': {
    '1+': 2.8,
    '1-': 2.75,
    '2++': 2.7,
    '2+': 2.65,
    '2-': 2.6,
    '3+': 2.55,
    '3': 2.5
  },
  'Nữ': {
    '1+': 2.15,
    '2': 2.1,
    '2-': 2.05
  }
};

const ADJUSTMENT_RULES = [
  { label: 'Vô địch Mini Game', value: 0.05, icon: Trophy, color: 'text-yellow-500' },
  { label: 'Á quân Mini Game', value: 0.02, icon: Award, color: 'text-gray-400' },
  { label: 'Vô địch PVNA', value: 0.05, icon: Trophy, color: 'text-yellow-600' },
  { label: 'Á quân PVNA', value: 0.03, icon: Award, color: 'text-gray-300' },
  { label: 'Giải 3 PVNA', value: 0.02, icon: Award, color: 'text-orange-400' },
  { label: 'Thua vòng bảng (3x)', value: -0.05, icon: AlertCircle, color: 'text-red-500' },
  { label: 'Thua bán kết (5x)', value: -0.05, icon: AlertCircle, color: 'text-red-400' },
];

interface Adjustment {
  id: number;
  member_id: number;
  type: string;
  value: number;
  description: string;
  created_at: string;
}

interface Match {
  id: number;
  t1p1_id: number;
  t1p2_id: number;
  t2p1_id: number;
  t2p2_id: number;
  t1_score: number;
  t2_score: number;
  created_at: string;
  t1p1_name: string;
  t1p2_name: string;
  t2p1_name: string;
  t2p2_name: string;
}

function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memberRes, adjRes, matchRes] = await Promise.all([
          fetch(`/api/members/${id}`),
          fetch(`/api/members/${id}/adjustments`),
          fetch(`/api/members/${id}/matches`)
        ]);
        
        if (!memberRes.ok) throw new Error('Member not found');
        
        const memberData = await memberRes.json();
        const adjData = await adjRes.json();
        const matchData = await matchRes.json();
        
        setMember(memberData);
        setAdjustments(adjData);
        setMatches(matchData);
      } catch (err) {
        console.error(err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!member) return null;

  const wins = matches.filter(m => {
    const isTeam1 = m.t1p1_id === member.id || m.t1p2_id === member.id;
    return isTeam1 ? m.t1_score > m.t2_score : m.t2_score > m.t1_score;
  }).length;
  const losses = matches.length - wins;
  const winRate = matches.length > 0 ? (wins / matches.length * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-800 font-sans pb-12">
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-all font-bold text-sm">
            <ArrowLeft size={18} />
            Quay lại
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 text-white p-1.5 rounded-lg shadow-md">
              <TrendingUp size={16} />
            </div>
            <span className="font-serif italic font-bold text-lg uppercase tracking-tight">Hồ sơ VĐV</span>
          </div>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm text-center">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-inner ${member.gender === 'Nam' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-pink-50 text-pink-600 border border-pink-100'}`}>
                {member.name.charAt(0)}
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 mb-1">{member.name}</h1>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${member.gender === 'Nam' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                  {member.gender}
                </span>
                <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-wider">
                  Tier {member.tier}
                </span>
              </div>

              <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                <p className="text-[10px] uppercase font-bold text-orange-400 mb-1 tracking-widest">Rating Hiện Tại</p>
                <p className="text-4xl font-mono font-black text-orange-600">{member.current_rating.toFixed(2)}</p>
                <div className="mt-4 pt-4 border-t border-orange-100 flex justify-between text-[10px] font-bold text-zinc-400">
                  <span>Rating gốc: {member.base_rating.toFixed(2)}</span>
                  <span className={member.current_rating >= member.base_rating ? 'text-green-500' : 'text-red-500'}>
                    {member.current_rating >= member.base_rating ? '+' : ''}{(member.current_rating - member.base_rating).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-xl border border-zinc-800">
              <h2 className="font-serif italic font-bold text-lg mb-6 flex items-center gap-2">
                <Activity size={18} className="text-orange-500" />
                Thống kê
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Trận đấu</p>
                  <p className="text-2xl font-mono font-bold">{matches.length}</p>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Tỉ lệ thắng</p>
                  <p className="text-2xl font-mono font-bold text-green-400">{winRate}%</p>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Thắng</p>
                  <p className="text-2xl font-mono font-bold text-blue-400">{wins}</p>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Thua</p>
                  <p className="text-2xl font-mono font-bold text-red-400">{losses}</p>
                </div>
              </div>
            </div>
          </div>

          {/* History Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="font-serif italic font-bold text-xl flex items-center gap-2">
                  <History size={20} className="text-orange-500" />
                  Lịch sử thi đấu
                </h2>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{matches.length} trận gần nhất</span>
              </div>
              <div className="divide-y divide-zinc-50">
                {matches.map(match => {
                  const isTeam1 = match.t1p1_id === member.id || match.t1p2_id === member.id;
                  const won = isTeam1 ? match.t1_score > match.t2_score : match.t2_score > match.t1_score;
                  return (
                    <div key={match.id} className="p-6 hover:bg-zinc-50 transition-colors">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase italic ${won ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {won ? 'Thắng' : 'Thua'}
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <p className="text-xs font-bold text-zinc-900">
                              {match.t1p1_name} & {match.t1p2_name}
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-1">vs {match.t2p1_name} & {match.t2p2_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-mono font-black text-zinc-900">
                              {match.t1_score} - {match.t2_score}
                            </p>
                            <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">
                              {new Date(match.created_at).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {matches.length === 0 && (
                  <div className="p-12 text-center opacity-30 italic text-sm">Chưa có dữ liệu trận đấu</div>
                )}
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-zinc-100">
                <h2 className="font-serif italic font-bold text-xl flex items-center gap-2">
                  <TrendingUp size={20} className="text-orange-500" />
                  Biến động Rating
                </h2>
              </div>
              <div className="divide-y divide-zinc-50">
                {adjustments.map(adj => (
                  <div key={adj.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${adj.value > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {adj.value > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{adj.description}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">
                          {new Date(adj.created_at).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className={`text-lg font-mono font-black ${adj.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {adj.value > 0 ? '+' : ''}{adj.value.toFixed(2)}
                    </div>
                  </div>
                ))}
                {adjustments.length === 0 && (
                  <div className="p-12 text-center opacity-30 italic text-sm">Chưa có biến động rating</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile/:id" element={<MemberProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

function Dashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterGender, setFilterGender] = useState<string>('All');
  const [filterTier, setFilterTier] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'members' | 'matchmaking'>('members');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [matchmakingPlayers, setMatchmakingPlayers] = useState<Member[]>([]);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedMatchCombo, setSelectedMatchCombo] = useState<any>(null);
  const [t1Score, setT1Score] = useState('11');
  const [t2Score, setT2Score] = useState('11');
  
  // Form states
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newTier, setNewTier] = useState('2+');

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchMembers = async () => {
    const res = await fetch('/api/members');
    const data = await res.json();
    setMembers(data);
  };

  const [userRole, setUserRole] = useState<string>(localStorage.getItem('userRole') || 'user');

  const authenticatedFetch = (url: string, options: any = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'x-user-role': userRole
      }
    });
  };

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    const base_rating = TIER_RATINGS[newGender][newTier];
    const res = await authenticatedFetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, gender: newGender, tier: newTier, base_rating })
    });
    
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Có lỗi xảy ra');
      return;
    }

    setNewName('');
    setIsAddModalOpen(false);
    fetchMembers();
  };

  const handleAdjust = async (value: number, label: string) => {
    if (!selectedMember) return;
    
    // For female players, negative adjustments are -0.02 instead of -0.05
    let finalValue = value;
    if (selectedMember.gender === 'Nữ' && value < 0) {
      finalValue = -0.02;
    }

    const res = await authenticatedFetch('/api/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        member_id: selectedMember.id, 
        value: finalValue, 
        description: label 
      })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Có lỗi xảy ra');
      return;
    }

    setIsAdjustModalOpen(false);
    fetchMembers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thành viên này?')) return;
    const res = await authenticatedFetch(`/api/members/${id}`, { method: 'DELETE' });
    
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Có lỗi xảy ra');
      return;
    }

    fetchMembers();
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                         m.tier.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesGender = filterGender === 'All' || m.gender === filterGender;
    const matchesTier = filterTier === 'All' || m.tier === filterTier;
    return matchesSearch && matchesGender && matchesTier;
  });

  const allTiers = Array.from(new Set([
    ...Object.keys(TIER_RATINGS['Nam']),
    ...Object.keys(TIER_RATINGS['Nữ'])
  ])).sort();

  const toggleMatchmakingPlayer = (member: Member) => {
    setMatchmakingPlayers(prev => {
      if (prev.find(p => p.id === member.id)) {
        return prev.filter(p => p.id !== member.id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, member];
    });
  };

  const calculateMatchmaking = () => {
    if (matchmakingPlayers.length !== 4) return null;
    
    const p = matchmakingPlayers;
    const combinations = [
      { team1: [p[0], p[1]], team2: [p[2], p[3]] },
      { team1: [p[0], p[2]], team2: [p[1], p[3]] },
      { team1: [p[0], p[3]], team2: [p[1], p[2]] },
    ];

    return combinations.map(combo => {
      const t1Rating = combo.team1[0].current_rating + combo.team1[1].current_rating;
      const t2Rating = combo.team2[0].current_rating + combo.team2[1].current_rating;
      const diff = Math.abs(t1Rating - t2Rating);
      const isBalanced = diff <= 0.05;
      return { ...combo, t1Rating, t2Rating, diff, isBalanced };
    }).sort((a, b) => a.diff - b.diff);
  };

  const matchmakingResults = calculateMatchmaking();

  const handleRecordMatch = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMatchCombo) return;

    const res = await authenticatedFetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        t1p1_id: selectedMatchCombo.team1[0].id,
        t1p2_id: selectedMatchCombo.team1[1].id,
        t2p1_id: selectedMatchCombo.team2[0].id,
        t2p2_id: selectedMatchCombo.team2[1].id,
        t1_score: parseInt(t1Score),
        t2_score: parseInt(t2Score)
      })
    });
    
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Có lỗi xảy ra');
      return;
    }

    setIsRecordModalOpen(false);
    setSelectedMatchCombo(null);
    fetchMembers();
    alert('Đã ghi nhận trận đấu và cập nhật rating!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-800 font-sans selection:bg-orange-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-orange-500 text-white p-2 rounded-lg shadow-lg shadow-orange-200 shrink-0">
              <TrendingUp size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight uppercase italic font-serif text-zinc-900 leading-none">PickleBoom</h1>
              <p className="text-[10px] opacity-50 uppercase tracking-widest font-mono text-orange-600 font-bold">Internal Rating System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <div className="flex bg-zinc-100 p-1 rounded-xl shrink-0 mr-2">
              <select 
                className="bg-transparent text-[10px] font-bold uppercase tracking-wider px-2 py-1 outline-none cursor-pointer text-zinc-600"
                value={userRole}
                onChange={(e) => {
                  const role = e.target.value;
                  setUserRole(role);
                  localStorage.setItem('userRole', role);
                }}
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex bg-zinc-100 p-1 rounded-xl shrink-0">
              <button 
                onClick={() => setActiveTab('members')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'members' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                <Users size={14} />
                Danh sách
              </button>
              <button 
                onClick={() => setActiveTab('matchmaking')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'matchmaking' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                <Swords size={14} />
                Ghép kèo {matchmakingPlayers.length > 0 && `(${matchmakingPlayers.length})`}
              </button>
            </div>
            {(userRole === 'admin' || userRole === 'moderator') && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-orange-500 text-white p-2.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full flex items-center gap-2 hover:bg-orange-600 transition-all active:scale-95 shadow-md shadow-orange-100 shrink-0"
              >
                <Plus size={18} />
                <span className="text-sm font-bold hidden sm:inline">Thêm VĐV</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'members' ? (
            <motion.div 
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Main List */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative group flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm vận động viên..." 
                      className="w-full bg-white border border-zinc-200 rounded-xl py-3 sm:py-3.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button 
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 rounded-full hover:bg-zinc-100 transition-all"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1 sm:flex-none">
                      <select 
                        className="w-full appearance-none bg-white border border-zinc-200 rounded-xl py-3 sm:py-3.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm text-xs sm:text-sm font-medium text-zinc-600 cursor-pointer"
                        value={filterGender}
                        onChange={(e) => setFilterGender(e.target.value)}
                      >
                        <option value="All">Tất cả giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                      <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
                    </div>

                    <div className="relative flex-1 sm:flex-none">
                      <select 
                        className="w-full appearance-none bg-white border border-zinc-200 rounded-xl py-3 sm:py-3.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm text-xs sm:text-sm font-medium text-zinc-600 cursor-pointer"
                        value={filterTier}
                        onChange={(e) => setFilterTier(e.target.value)}
                      >
                        <option value="All">Tất cả Tier</option>
                        {allTiers.map(tier => (
                          <option key={tier} value={tier}>{tier}</option>
                        ))}
                      </select>
                      <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="grid grid-cols-4 sm:grid-cols-5 p-4 border-b border-zinc-100 bg-zinc-50 text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                    <div className="col-span-2">Vận động viên</div>
                    <div className="hidden sm:block">Tier</div>
                    <div>Rating</div>
                    <div className="text-right">Thao tác</div>
                  </div>
                  
                  <div className="divide-y divide-zinc-100">
                    {filteredMembers.map((member) => (
                      <motion.div 
                        layout
                        key={member.id}
                        className="grid grid-cols-4 sm:grid-cols-5 p-3 sm:p-4 items-center hover:bg-orange-50 transition-colors group"
                      >
                        <div className="col-span-2 flex items-center gap-2 sm:gap-3">
                          <Link to={`/profile/${member.id}`} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-inner shrink-0 hover:scale-110 transition-transform ${member.gender === 'Nam' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-pink-50 text-pink-600 border border-pink-100'}`}>
                            {member.name.charAt(0)}
                          </Link>
                          <div className="min-w-0">
                            <Link to={`/profile/${member.id}`} className="font-bold text-xs sm:text-sm text-zinc-900 truncate hover:text-orange-500 transition-colors">{member.name}</Link>
                            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                              {member.gender}
                              <span className="sm:hidden">• {member.tier}</span>
                            </p>
                          </div>
                        </div>
                        <div className="hidden sm:block font-mono text-sm font-medium text-zinc-600">{member.tier}</div>
                        <div className="font-mono text-xs sm:text-sm font-bold text-orange-600">
                          {member.current_rating.toFixed(2)}
                        </div>
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <button 
                            onClick={() => toggleMatchmakingPlayer(member)}
                            className={`p-1.5 sm:p-2 rounded-lg transition-all ${matchmakingPlayers.find(p => p.id === member.id) ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-zinc-400 hover:bg-zinc-100'}`}
                            title="Chọn ghép kèo"
                          >
                            <Swords size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          {(userRole === 'admin' || userRole === 'moderator') && (
                            <>
                              <button 
                                onClick={() => {
                                  setSelectedMember(member);
                                  setIsAdjustModalOpen(true);
                                }}
                                className="p-1.5 sm:p-2 text-zinc-400 hover:bg-orange-500 hover:text-white rounded-lg transition-all"
                                title="Chấm trình"
                              >
                                <TrendingUp size={14} className="sm:w-4 sm:h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(member.id)}
                                className="p-1.5 sm:p-2 text-zinc-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                              >
                                <Trash2 size={14} className="sm:w-4 sm:h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {filteredMembers.length === 0 && (
                      <div className="p-12 text-center opacity-30 italic text-sm">
                        Không tìm thấy vận động viên nào
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar: Rules & Stats */}
              <div className="space-y-6">
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <h2 className="font-serif italic font-bold text-base sm:text-lg mb-4 flex items-center gap-2 text-zinc-900">
                    <Info size={18} className="text-orange-500" />
                    Bảng quy đổi Tier
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400 mb-2">Nam</p>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(TIER_RATINGS['Nam']).map(([tier, rating]) => (
                          <div key={tier} className="bg-zinc-50 border border-zinc-100 p-2 rounded text-center">
                            <p className="text-[10px] font-bold text-zinc-500">{tier}</p>
                            <p className="font-mono text-[10px] sm:text-xs font-bold text-orange-600">{rating}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400 mb-2">Nữ</p>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(TIER_RATINGS['Nữ']).map(([tier, rating]) => (
                          <div key={tier} className="bg-zinc-50 border border-zinc-100 p-2 rounded text-center">
                            <p className="text-[10px] font-bold text-zinc-500">{tier}</p>
                            <p className="font-mono text-[10px] sm:text-xs font-bold text-orange-600">{rating}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-zinc-800">
                  <h2 className="font-serif italic font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
                    <Award size={18} className="text-orange-500" />
                    Quy định điều chỉnh
                  </h2>
                  <ul className="space-y-3 text-[11px] sm:text-xs opacity-90">
                    <li className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-400">Vô địch Mini Game</span>
                      <span className="text-orange-400 font-bold">+0.05</span>
                    </li>
                    <li className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-400">Vô địch PVNA</span>
                      <span className="text-orange-400 font-bold">+0.05</span>
                    </li>
                    <li className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-400">Thua vòng bảng (Nam)</span>
                      <span className="text-red-400 font-bold">-0.05</span>
                    </li>
                    <li className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-400">Thua vòng bảng (Nữ)</span>
                      <span className="text-red-400 font-bold">-0.02</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-[10px] italic text-zinc-500">
                    * Dung sai ghép kèo: ±0.05 / cặp
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="matchmaking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-zinc-900 text-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-zinc-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h2 className="font-serif italic font-bold text-xl sm:text-2xl flex items-center gap-2">
                      <Swords size={24} className="text-orange-500" />
                      Ghép kèo cân bằng
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-500 mt-1">Chọn 4 vận động viên từ tab Danh sách để phân tích</p>
                  </div>
                  {matchmakingPlayers.length > 0 && (
                    <button 
                      onClick={() => setMatchmakingPlayers([])}
                      className="text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors bg-orange-500/10 px-4 py-2 rounded-lg"
                    >
                      XÓA TẤT CẢ
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="aspect-square rounded-2xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden group bg-zinc-800/20">
                      {matchmakingPlayers[i] ? (
                        <>
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold mb-3 ${matchmakingPlayers[i].gender === 'Nam' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'}`}>
                            {matchmakingPlayers[i].name.charAt(0)}
                          </div>
                          <p className="text-xs font-bold truncate w-full mb-1">{matchmakingPlayers[i].name}</p>
                          <p className="text-xs font-mono font-bold text-orange-500">{matchmakingPlayers[i].current_rating.toFixed(2)}</p>
                          <button 
                            onClick={() => toggleMatchmakingPlayer(matchmakingPlayers[i])}
                            className="absolute inset-0 bg-red-500/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <X size={20} />
                          </button>
                        </>
                      ) : (
                        <div className="text-zinc-700 flex flex-col items-center">
                          <Plus size={24} className="mb-2 opacity-20" />
                          <p className="text-[10px] font-bold tracking-widest opacity-30 uppercase">Trống</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {matchmakingResults ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-zinc-800"></div>
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Kết quả phân tích</p>
                      <div className="h-px flex-1 bg-zinc-800"></div>
                    </div>
                    
                    {matchmakingResults.map((res, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className={`p-5 rounded-2xl border transition-all ${res.isBalanced ? 'border-orange-500/40 bg-orange-500/5 shadow-lg shadow-orange-500/5' : 'border-zinc-800 bg-zinc-800/30'} flex flex-col sm:flex-row justify-between items-center gap-6`}
                      >
                        <div className="flex items-center gap-6 flex-1 w-full sm:w-auto justify-center sm:justify-start">
                          <div className="text-center">
                            <p className="text-[9px] uppercase text-zinc-500 font-bold mb-2 tracking-tighter">Team 1</p>
                            <div className="flex -space-x-3">
                              {res.team1.map(p => (
                                <div key={p.id} title={p.name} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-zinc-900 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg ${p.gender === 'Nam' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                                  {p.name.charAt(0)}
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] font-mono mt-2 text-zinc-400">{res.t1Rating.toFixed(2)}</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-orange-500 font-black italic text-xl sm:text-2xl tracking-tighter">VS</div>
                            <div className="h-8 w-px bg-zinc-800 my-1"></div>
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] uppercase text-zinc-500 font-bold mb-2 tracking-tighter">Team 2</p>
                            <div className="flex -space-x-3">
                              {res.team2.map(p => (
                                <div key={p.id} title={p.name} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-zinc-900 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg ${p.gender === 'Nam' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                                  {p.name.charAt(0)}
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] font-mono mt-2 text-zinc-400">{res.t2Rating.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end bg-black/20 sm:bg-transparent p-4 sm:p-0 rounded-xl">
                          <div className="text-right">
                            <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Chênh lệch</p>
                            <p className={`text-xl font-mono font-bold ${res.isBalanced ? 'text-green-400' : 'text-zinc-500'}`}>
                              {res.diff.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {res.isBalanced ? (
                              <div className="bg-green-500 text-white p-3 rounded-2xl shadow-lg shadow-green-500/20" title="Kèo cân">
                                <CheckCircle2 size={24} />
                              </div>
                            ) : (
                              <div className="bg-zinc-800 text-zinc-600 p-3 rounded-2xl" title="Kèo lệch">
                                <AlertCircle size={24} />
                              </div>
                            )}
                            {(userRole === 'admin' || userRole === 'moderator') && (
                              <button 
                                onClick={() => {
                                  setSelectedMatchCombo(res);
                                  setIsRecordModalOpen(true);
                                }}
                                className="bg-orange-500 text-white p-2 rounded-xl text-[10px] font-bold hover:bg-orange-600 transition-all"
                              >
                                GHI KẾT QUẢ
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                      <Swords size={40} />
                    </div>
                    <p className="text-zinc-500 font-medium max-w-xs mx-auto">
                      Vui lòng chọn đủ 4 vận động viên từ <span className="text-orange-500 font-bold">Danh sách</span> để bắt đầu phân tích kèo.
                    </p>
                    <button 
                      onClick={() => setActiveTab('members')}
                      className="mt-6 text-xs font-bold text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
                    >
                      Quay lại Danh sách
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-[#141414]/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white border border-zinc-200 rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-serif italic font-bold mb-6 text-zinc-900">Thêm Vận Động Viên</h2>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Họ và tên</label>
                  <input 
                    required
                    type="text" 
                    className="w-full border border-zinc-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Giới tính</label>
                    <select 
                      className="w-full border border-zinc-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      value={newGender}
                      onChange={(e) => {
                        const gender = e.target.value as 'Nam' | 'Nữ';
                        setNewGender(gender);
                        setNewTier(Object.keys(TIER_RATINGS[gender])[0]);
                      }}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Tier ban đầu</label>
                    <select 
                      className="w-full border border-zinc-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      value={newTier}
                      onChange={(e) => setNewTier(e.target.value)}
                    >
                      {Object.keys(TIER_RATINGS[newGender]).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100">
                    Xác nhận thêm
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Adjust Rating Modal */}
      <AnimatePresence>
        {isAdjustModalOpen && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdjustModalOpen(false)}
              className="absolute inset-0 bg-[#141414]/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white border border-zinc-200 rounded-3xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-serif italic font-bold text-zinc-900">Chấm trình: {selectedMember.name}</h2>
                <p className="text-sm text-zinc-500">Rating hiện tại: <span className="font-mono font-bold text-orange-600">{selectedMember.current_rating.toFixed(2)}</span></p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADJUSTMENT_RULES.map((rule) => (
                  <button
                    key={rule.label}
                    onClick={() => handleAdjust(rule.value, rule.label)}
                    className="flex items-center gap-3 p-4 border border-zinc-100 rounded-2xl hover:bg-orange-500 hover:text-white transition-all text-left group shadow-sm hover:shadow-orange-200"
                  >
                    <div className={`p-2 rounded-lg bg-zinc-50 group-hover:bg-white/20 ${rule.color}`}>
                      <rule.icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{rule.label}</p>
                      <p className={`text-[10px] font-mono font-bold ${rule.value > 0 ? 'text-green-600' : 'text-red-600'} group-hover:text-white`}>
                        {rule.value > 0 ? '+' : ''}{selectedMember.gender === 'Nữ' && rule.value < 0 ? '-0.02' : rule.value}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setIsAdjustModalOpen(false)}
                className="w-full mt-6 border border-zinc-200 py-3 rounded-xl text-sm font-bold text-zinc-400 hover:bg-zinc-50 transition-all"
              >
                Hủy bỏ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Record Match Modal */}
      <AnimatePresence>
        {isRecordModalOpen && selectedMatchCombo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecordModalOpen(false)}
              className="absolute inset-0 bg-[#141414]/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white border border-zinc-200 rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-serif italic font-bold mb-6 text-zinc-900">Ghi nhận kết quả</h2>
              <form onSubmit={handleRecordMatch} className="space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-zinc-400 mb-3">Team 1</p>
                    <div className="flex justify-center -space-x-2 mb-4">
                      {selectedMatchCombo.team1.map((p: any) => (
                        <div key={p.id} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md ${p.gender === 'Nam' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                          {p.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <input 
                      type="number" 
                      className="w-full text-center text-3xl font-mono font-black border border-zinc-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      value={t1Score}
                      onChange={(e) => setT1Score(e.target.value)}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-zinc-400 mb-3">Team 2</p>
                    <div className="flex justify-center -space-x-2 mb-4">
                      {selectedMatchCombo.team2.map((p: any) => (
                        <div key={p.id} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-md ${p.gender === 'Nam' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                          {p.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <input 
                      type="number" 
                      className="w-full text-center text-3xl font-mono font-black border border-zinc-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                      value={t2Score}
                      onChange={(e) => setT2Score(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="flex-1 border border-zinc-200 py-4 rounded-xl font-bold text-zinc-400 hover:bg-zinc-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                  >
                    Lưu kết quả
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

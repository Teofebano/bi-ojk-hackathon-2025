'use client';

import { useState, useEffect } from 'react';
import { LogOut, ChevronDown, User, TrendingUp, TrendingDown, AlertTriangle, Shield, Activity, DollarSign, PieChart, BarChart3, Target, BookOpen, Clock, ExternalLink, Umbrella, Heart, Home, Car, Star, Users, Calendar, ArrowRight } from 'lucide-react';
import { AuthProvider, useAuth } from '../chat/FirebaseAuthContext';

interface FinancialData {
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFund: number;
  investments: number;
  lifeInsurance: number;
  healthInsurance: boolean;
  propertyInsurance: number;
  insurancePremiums: number;
}

interface HealthScore {
  score: number;
  category: 'fragile' | 'stable' | 'strong';
  factors: {
    savings: number;
    debt: number;
    emergency: number;
    insurance: number;
  };
}

function UserAvatarDropdown({ user, logout }: { user: any; logout: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white rounded-full px-3 py-2 shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {user.displayName || user.email}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.displayName || 'User'}</p>
            <p className="text-xs text-gray-500 truncate w-full" title={user.email}>
              {user.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Speedometer({ score, size = 200 }: { score: number; size?: number }) {
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Convert score (0-100) to angle (-120 to +120 degrees)
  const angle = -120 + (score / 100) * 240;
  const radians = (angle * Math.PI) / 180;
  
  // Calculate pointer end position
  const pointerLength = radius - 10;
  const pointerX = centerX + Math.cos(radians) * pointerLength;
  const pointerY = centerY + Math.sin(radians) * pointerLength;
  
  // Create arc path for colored segments
  const createArc = (startAngle: number, endAngle: number, color: string) => {
    const start = (startAngle * Math.PI) / 180;
    const end = (endAngle * Math.PI) / 180;
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    const x1 = centerX + Math.cos(start) * radius;
    const y1 = centerY + Math.sin(start) * radius;
    const x2 = centerX + Math.cos(end) * radius;
    const y2 = centerY + Math.sin(end) * radius;
    
    return (
      <path
        d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
        fill={color}
        opacity="0.7"
      />
    );
  };

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Background circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke="#2e3192"
        strokeWidth="2"
        opacity="0.3"
      />
      
      {/* Colored segments */}
      {createArc(-120, -40, '#ef4444')} {/* Red: 0-33 */}
      {createArc(-40, 40, '#eab308')}   {/* Yellow: 33-66 */}
      {createArc(40, 120, '#22c55e')}   {/* Green: 66-100 */}
      
      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map((tick) => {
        const tickAngle = -120 + (tick / 100) * 240;
        const tickRadians = (tickAngle * Math.PI) / 180;
        const innerRadius = radius - 15;
        const outerRadius = radius - 5;
        
        const x1 = centerX + Math.cos(tickRadians) * innerRadius;
        const y1 = centerY + Math.sin(tickRadians) * innerRadius;
        const x2 = centerX + Math.cos(tickRadians) * outerRadius;
        const y2 = centerY + Math.sin(tickRadians) * outerRadius;
        
        return (
          <g key={tick}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#7ffcff"
              strokeWidth="2"
            />
            <text
              x={centerX + Math.cos(tickRadians) * (innerRadius - 15)}
              y={centerY + Math.sin(tickRadians) * (innerRadius - 15)}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#7ffcff"
              fontSize="12"
              fontFamily="var(--font-body)"
            >
              {tick}
            </text>
          </g>
        );
      })}
      
      {/* Pointer */}
      <line
        x1={centerX}
        y1={centerY}
        x2={pointerX}
        y2={pointerY}
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Center dot */}
      <circle cx={centerX} cy={centerY} r="6" fill="#7ffcff" />
      <circle cx={centerX} cy={centerY} r="3" fill="#ffffff" />
    </svg>
  );
}


function HealthScoreCard({ score }: { score: HealthScore }) {
  const getScoreColor = (category: string) => {
    switch (category) {
      case 'fragile': return '#ef4444';
      case 'stable': return '#eab308';
      case 'strong': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getScoreIcon = (category: string) => {
    switch (category) {
      case 'fragile': return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case 'stable': return <Activity className="w-6 h-6 text-yellow-400" />;
      case 'strong': return <Shield className="w-6 h-6 text-green-400" />;
      default: return <Activity className="w-6 h-6 text-gray-400" />;
    }
  };

  const getScoreBackground = (category: string) => {
    switch (category) {
      case 'fragile': return 'bg-red-500/10 border-red-500/30';
      case 'stable': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'strong': return 'bg-green-500/10 border-green-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className={`bg-[#181e5a]/80 rounded-2xl white-shadow p-6 border-2 ${getScoreBackground(score.category)}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {getScoreIcon(score.category)}
          <h3 className="font-title text-xl text-[#7ffcff]">Skor Kesehatan Keuangan</h3>
        </div>
        <p className="text-white/80 font-body text-sm capitalize">
          Kesehatan Keuangan {score.category === 'fragile' ? 'Rapuh' : score.category === 'stable' ? 'Stabil' : 'Kuat'}
        </p>
      </div>

      {/* Main Speedometer */}
      <div className="mb-6">
        <Speedometer score={score.score} size={220} />
        <div className="text-center mt-2">
          <div className="text-3xl font-title" style={{ color: getScoreColor(score.category) }}>
            {score.score}
          </div>
          <div className="text-white/60 text-sm font-body">Skor Kesehatan Keuangan</div>
        </div>
      </div>

      {/* Score Breakdown & Justification */}
      <div className="bg-[#2e3192]/30 rounded-lg p-4">
        <h4 className="font-title text-lg text-[#7ffcff] mb-4">Mengapa Anda Mendapat Skor Ini</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-white font-body text-sm">Tingkat Tabungan</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#7ffcff] font-title text-sm">{score.factors.savings}/100</span>
              <span className="text-xs text-white/60">
                {score.factors.savings >= 80 ? 'Sangat Baik' : 
                 score.factors.savings >= 60 ? 'Baik' : 
                 score.factors.savings >= 40 ? 'Cukup' : 'Perlu Diperbaiki'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-body text-sm">Manajemen Utang</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#7ffcff] font-title text-sm">{score.factors.debt}/100</span>
              <span className="text-xs text-white/60">
                {score.factors.debt >= 80 ? 'Sangat Baik' : 
                 score.factors.debt >= 60 ? 'Baik' : 
                 score.factors.debt >= 40 ? 'Cukup' : 'Berisiko Tinggi'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Umbrella className="w-4 h-4 text-blue-400" />
              <span className="text-white font-body text-sm">Dana Darurat</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#7ffcff] font-title text-sm">{score.factors.emergency}/100</span>
              <span className="text-xs text-white/60">
                {score.factors.emergency >= 80 ? 'Terlindungi Baik' : 
                 score.factors.emergency >= 60 ? 'Memadai' : 
                 score.factors.emergency >= 40 ? 'Sedang Dibangun' : 'Rentan'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-white font-body text-sm">Perlindungan Asuransi</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[#7ffcff] font-title text-sm">{score.factors.insurance}/100</span>
              <span className="text-xs text-white/60">
                {score.factors.insurance >= 80 ? 'Terlindungi Penuh' : 
                 score.factors.insurance >= 60 ? 'Terlindungi Baik' : 
                 score.factors.insurance >= 40 ? 'Perlindungan Dasar' : 'Kurang Terlindungi'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Key Insights */}
        <div className="mt-4 pt-4 border-t border-[#7ffcff]/20">
          <h5 className="font-title text-sm text-[#7ffcff] mb-2">Wawasan Utama</h5>
          <div className="space-y-2">
            {score.factors.insurance >= 80 && (
              <p className="text-xs text-green-300 font-body">✓ Perlindungan asuransi Anda memberikan proteksi kekayaan yang sangat baik</p>
            )}
            {score.factors.savings >= 70 && (
              <p className="text-xs text-green-300 font-body">✓ Tingkat tabungan yang kuat mendukung pembangunan kekayaan jangka panjang</p>
            )}
            {score.factors.debt >= 70 && (
              <p className="text-xs text-green-300 font-body">✓ Tingkat utang dikelola dengan baik dan berkelanjutan</p>
            )}
            {score.factors.emergency >= 70 && (
              <p className="text-xs text-green-300 font-body">✓ Dana darurat memberikan keamanan finansial yang baik</p>
            )}
            
            {score.factors.insurance < 60 && (
              <p className="text-xs text-orange-300 font-body">⚠ Pertimbangkan untuk meningkatkan perlindungan asuransi guna melindungi kekayaan</p>
            )}
            {score.factors.savings < 50 && (
              <p className="text-xs text-orange-300 font-body">⚠ Fokus pada peningkatan tingkat tabungan melalui budgeting atau unit link</p>
            )}
            {score.factors.debt < 50 && (
              <p className="text-xs text-orange-300 font-body">⚠ Tingkat utang yang tinggi dapat membatasi fleksibilitas keuangan Anda</p>
            )}
            {score.factors.emergency < 50 && (
              <p className="text-xs text-orange-300 font-body">⚠ Membangun dana darurat yang lebih besar harus menjadi prioritas</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format IDR currency
function formatIDR(amount: number): string {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)} M`; // Milyar
  } else if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)} Jt`; // Juta
  } else if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)} Rb`; // Ribu
  } else {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }
}

function FinancialOverviewCard({ data }: { data: FinancialData }) {
  const netWorth = data.totalAssets - data.totalLiabilities;
  const monthlyCashflow = data.monthlyIncome - data.monthlyExpenses;
  const savingsRate = data.monthlyIncome > 0 ? ((monthlyCashflow / data.monthlyIncome) * 100) : 0;

  return (
    <div className="bg-[#181e5a]/80 rounded-2xl white-shadow p-6">
      <h3 className="font-title text-xl text-[#7ffcff] mb-6 flex items-center">
        <Shield className="w-6 h-6 mr-2" />
        Ringkasan Kekayaan & Perlindungan
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/80 font-body">Kekayaan Bersih</span>
            <span className={`font-title text-lg ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatIDR(netWorth)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/80 font-body">Perlindungan Asuransi Jiwa</span>
            <span className="text-blue-400 font-title">{formatIDR(data.lifeInsurance)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/80 font-body">Premi Asuransi Bulanan</span>
            <span className="text-orange-400 font-title">{formatIDR(data.insurancePremiums)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/80 font-body">Asuransi Kesehatan</span>
            <span className={`font-title ${data.healthInsurance ? 'text-green-400' : 'text-red-400'}`}>
              {data.healthInsurance ? '✓ Terlindungi' : '✗ Tidak Terlindungi'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/80 font-body">Asuransi Properti</span>
            <span className="text-purple-400 font-title">{formatIDR(data.propertyInsurance)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/80 font-body">Arus Kas Bulanan</span>
            <div className="flex items-center space-x-1">
              {monthlyCashflow >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`font-title ${monthlyCashflow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatIDR(monthlyCashflow)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/80 font-body">Dana Darurat</span>
            <span className="text-green-400 font-title">{formatIDR(data.emergencyFund)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/80 font-body">Rasio Perlindungan</span>
            <span className="text-[#7ffcff] font-title">
              {((data.lifeInsurance / (data.monthlyIncome * 12)) || 0).toFixed(1)}x Pendapatan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendationsCard() {
  const recommendations = [
    {
      icon: <Heart className="w-5 h-5 text-red-400" />,
      title: "Amankan Perlindungan Asuransi Jiwa",
      description: "Lindungi masa depan keuangan keluarga dengan perlindungan asuransi jiwa yang memadai senilai 10-12x pendapatan tahunan Anda",
      priority: "high"
    },
    {
      icon: <Umbrella className="w-5 h-5 text-blue-400" />,
      title: "Asuransi Kesehatan Komprehensif",
      description: "Pastikan Anda memiliki asuransi kesehatan yang kuat untuk melindungi dari darurat medis yang dapat menghabiskan tabungan",
      priority: "high"
    },
    {
      icon: <Shield className="w-5 h-5 text-green-400" />,
      title: "Investasi Berbasis Asuransi (Unit Link)",
      description: "Pertimbangkan unit link yang menggabungkan perlindungan dengan pembangunan kekayaan dalam satu produk",
      priority: "medium"
    },
    {
      icon: <Home className="w-5 h-5 text-purple-400" />,
      title: "Perlindungan Properti & Aset",
      description: "Amankan asuransi rumah dan kendaraan untuk melindungi aset fisik dari kerugian tak terduga",
      priority: "medium"
    }
  ];

  return (
    <div className="bg-[#181e5a]/80 rounded-2xl white-shadow p-6">
      <h3 className="font-title text-xl text-[#7ffcff] mb-6">Rekomendasi</h3>
      
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-[#2e3192]/30 rounded-lg">
            <div className="flex-shrink-0">
              {rec.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-body font-semibold text-white">{rec.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full font-body ${
                  rec.priority === 'high' 
                    ? 'bg-red-500/20 text-red-300' 
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {rec.priority} priority
                </span>
              </div>
              <p className="text-white/70 text-sm font-body">{rec.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvestmentForecastChart({ data }: { data: FinancialData }) {
  const years = 5;
  const annualReturn = 0.08; // 8% annual return (conservative for insurance-linked products)
  const monthlyContribution = data.monthlyIncome - data.monthlyExpenses - data.insurancePremiums; // Available savings after insurance
  const initialInvestment = data.investments;
  
  // Generate data points for the chart
  const generateForecastData = () => {
    const points = [];
    const monthlyReturnRate = annualReturn / 12;
    
    for (let year = 0; year <= years; year++) {
      const months = year * 12;
      
      // With investment (compound growth + monthly contributions)
      let withInvestment = initialInvestment;
      for (let m = 0; m < months; m++) {
        withInvestment = withInvestment * (1 + monthlyReturnRate) + monthlyContribution;
      }
      
      // Without investment (just savings)
      const withoutInvestment = initialInvestment + (monthlyContribution * months);
      
      points.push({
        year,
        withInvestment: Math.round(withInvestment),
        withoutInvestment: Math.round(withoutInvestment)
      });
    }
    
    return points;
  };
  
  const forecastData = generateForecastData();
  const maxValue = Math.max(...forecastData.map(d => d.withInvestment));
  const chartHeight = 200;
  const chartWidth = 400;
  const padding = 40;
  
  // Create SVG path for lines
  const createPath = (data: number[], color: string) => {
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding);
      const y = chartHeight - padding - ((value / maxValue) * (chartHeight - 2 * padding));
      return `${x},${y}`;
    }).join(' L ');
    
    return (
      <path
        d={`M ${points}`}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };
  
  return (
    <div className="bg-[#181e5a]/80 rounded-2xl white-shadow p-6">
      <h3 className="font-title text-xl text-[#7ffcff] mb-6 flex items-center">
        <TrendingUp className="w-6 h-6 mr-2" />
        Proyeksi Investasi Unit Link (5 Tahun)
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="flex flex-col items-center">
          <svg width={chartWidth} height={chartHeight} className="mb-4">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map(year => {
              const x = padding + (year / 5) * (chartWidth - 2 * padding);
              return (
                <g key={year}>
                  <line
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={chartHeight - padding}
                    stroke="#2e3192"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <text
                    x={x}
                    y={chartHeight - 15}
                    textAnchor="middle"
                    fill="#7ffcff"
                    fontSize="12"
                    fontFamily="var(--font-body)"
                  >
                    Year {year}
                  </text>
                </g>
              );
            })}
            
            {/* Y-axis grid and labels */}
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
              const y = chartHeight - padding - (ratio * (chartHeight - 2 * padding));
              const value = Math.round(maxValue * ratio);
              return (
                <g key={ratio}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#2e3192"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <text
                    x={25}
                    y={y + 4}
                    textAnchor="middle"
                    fill="#7ffcff"
                    fontSize="10"
                    fontFamily="var(--font-body)"
                  >
                    ${(value / 1000)}K
                  </text>
                </g>
              );
            })}
            
            {/* Investment line (with growth) */}
            {createPath(forecastData.map(d => d.withInvestment), '#22c55e')}
            
            {/* No investment line (just savings) */}
            {createPath(forecastData.map(d => d.withoutInvestment), '#ef4444')}
            
            {/* Data points */}
            {forecastData.map((point, index) => {
              const x = padding + (index / (forecastData.length - 1)) * (chartWidth - 2 * padding);
              const yInvest = chartHeight - padding - ((point.withInvestment / maxValue) * (chartHeight - 2 * padding));
              const yNoInvest = chartHeight - padding - ((point.withoutInvestment / maxValue) * (chartHeight - 2 * padding));
              
              return (
                <g key={index}>
                  <circle cx={x} cy={yInvest} r="4" fill="#22c55e" />
                  <circle cx={x} cy={yNoInvest} r="4" fill="#ef4444" />
                </g>
              );
            })}
          </svg>
          
          {/* Legend */}
          <div className="flex space-x-4 text-sm font-body">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-green-500 rounded"></div>
              <span className="text-white">Dengan Unit Link + Perlindungan (8% per tahun)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-1 bg-red-500 rounded"></div>
              <span className="text-white">Tanpa Perlindungan</span>
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="space-y-4">
          <div className="bg-[#2e3192]/30 rounded-lg p-4">
            <h4 className="font-title text-lg text-[#7ffcff] mb-3">Proyeksi 5 Tahun</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80 font-body">Dengan Unit Link + Perlindungan:</span>
                <span className="text-green-400 font-title text-lg">
                  {formatIDR(forecastData[5].withInvestment)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white/80 font-body">Tanpa Perlindungan:</span>
                <span className="text-red-400 font-title text-lg">
                  {formatIDR(forecastData[5].withoutInvestment)}
                </span>
              </div>
              
              <div className="border-t border-[#7ffcff]/30 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-white font-body font-semibold">Selisih:</span>
                  <span className="text-[#7ffcff] font-title text-xl">
                    {formatIDR(forecastData[5].withInvestment - forecastData[5].withoutInvestment)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#2e3192]/30 rounded-lg p-4">
            <h4 className="font-title text-sm text-[#7ffcff] mb-2">Asumsi</h4>
            <ul className="text-xs text-white/70 font-body space-y-1">
              <li>• Hasil tahunan unit link: 8%</li>
              <li>• Tabungan bulanan setelah asuransi: {formatIDR(monthlyContribution)}</li>
              <li>• Premi asuransi: {formatIDR(data.insurancePremiums)}/bulan</li>
              <li>• Termasuk perlindungan asuransi jiwa</li>
              <li>• Manfaat pajak atas premi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Article {
  id: number;
  title: string;
  category: string;
  readTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  url: string;
  icon: React.ReactNode;
}

interface InsuranceProduct {
  id: number;
  name: string;
  provider: string;
  type: 'life' | 'health' | 'property' | 'ulip';
  monthlyPremium: number;
  coverage: number;
  rating: number;
  customers: number;
  keyFeatures: string[];
  description: string;
  icon: React.ReactNode;
  recommended?: boolean;
}

function InsuranceMarketplace() {
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const insuranceProducts: InsuranceProduct[] = [
    {
      id: 1,
      name: "Perlindungan Keluarga Sejahtera",
      provider: "Prudential Indonesia",
      type: "life",
      monthlyPremium: 3750000, // ~250 USD
      coverage: 15000000000, // 15M IDR
      rating: 4.8,
      customers: 15000,
      keyFeatures: ["Perlindungan Jiwa Berjangka", "Santunan Kecelakaan", "Bebas Premi", "Manfaat Pajak"],
      description: "Asuransi jiwa berjangka komprehensif yang memberikan keamanan finansial bagi keluarga dengan premi terjangkau.",
      icon: <Heart className="w-6 h-6" />,
      recommended: true
    },
    {
      id: 2,
      name: "Unit Link Membangun Kekayaan",
      provider: "Allianz Indonesia",
      type: "ulip",
      monthlyPremium: 7500000, // ~500 USD
      coverage: 12000000000, // 12M IDR
      rating: 4.6,
      customers: 8500,
      keyFeatures: ["Perlindungan + Investasi", "Switching Dana", "Penarikan Sebagian", "Penghematan Pajak"],
      description: "Unit Link yang menggabungkan perlindungan jiwa dengan peluang investasi yang mengikuti pasar modal.",
      icon: <TrendingUp className="w-6 h-6" />,
      recommended: true
    },
    {
      id: 3,
      name: "Perisai Kesehatan Lengkap",
      provider: "AXA Mandiri",
      type: "health",
      monthlyPremium: 5250000, // ~350 USD
      coverage: 7500000000, // 7.5M IDR
      rating: 4.7,
      customers: 25000,
      keyFeatures: ["Rawat Inap Cashless", "Rawat Jalan", "Penyakit Kritis", "Check-up Tahunan"],
      description: "Asuransi kesehatan komprehensif yang menanggung rawat inap, operasi, dan perawatan penyakit kritis.",
      icon: <Umbrella className="w-6 h-6" />
    },
    {
      id: 4,
      name: "Proteksi Rumah & Kendaraan",
      provider: "Asuransi Sinar Mas",
      type: "property",
      monthlyPremium: 2250000, // ~150 USD
      coverage: 4500000000, // 4.5M IDR
      rating: 4.5,
      customers: 12000,
      keyFeatures: ["Perlindungan Struktur Rumah", "Asuransi Isi Rumah", "All Risk Kendaraan", "Bencana Alam"],
      description: "Asuransi gabungan rumah dan kendaraan yang melindungi aset berharga dari pencurian, kerusakan, dan bencana.",
      icon: <Home className="w-6 h-6" />
    },
    {
      id: 5,
      name: "Perawatan Lansia Prima",
      provider: "Manulife Indonesia",
      type: "health",
      monthlyPremium: 6750000, // ~450 USD
      coverage: 11250000000, // 11.25M IDR
      rating: 4.9,
      customers: 5500,
      keyFeatures: ["Perlindungan Usia Lanjut", "Penyakit Bawaan", "Home Care", "Ambulans"],
      description: "Asuransi kesehatan khusus lansia dengan perlindungan medis dan perawatan komprehensif.",
      icon: <Shield className="w-6 h-6" />
    },
    {
      id: 6,
      name: "Rencana Profesional Muda",
      provider: "Great Eastern Indonesia",
      type: "life",
      monthlyPremium: 2700000, // ~180 USD
      coverage: 9000000000, // 9M IDR
      rating: 4.4,
      customers: 18000,
      keyFeatures: ["Premi Rendah", "Uang Pertanggungan Meningkat", "Perlindungan Karir", "Kredit Pendidikan"],
      description: "Asuransi jiwa terjangkau yang disesuaikan untuk profesional muda yang memulai perjalanan keuangan.",
      icon: <Target className="w-6 h-6" />
    }
  ];

  const filterTypes = [
    { value: 'all', label: 'Semua Produk', icon: <Shield className="w-4 h-4" /> },
    { value: 'life', label: 'Asuransi Jiwa', icon: <Heart className="w-4 h-4" /> },
    { value: 'health', label: 'Asuransi Kesehatan', icon: <Umbrella className="w-4 h-4" /> },
    { value: 'ulip', label: 'Unit Link', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'property', label: 'Asuransi Properti', icon: <Home className="w-4 h-4" /> }
  ];

  const filteredProducts = selectedType === 'all' 
    ? insuranceProducts 
    : insuranceProducts.filter(product => product.type === selectedType);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'life': return 'bg-red-500/20 text-red-300';
      case 'health': return 'bg-blue-500/20 text-blue-300';
      case 'ulip': return 'bg-green-500/20 text-green-300';
      case 'property': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'life': return 'jiwa';
      case 'health': return 'kesehatan';
      case 'ulip': return 'unit link';
      case 'property': return 'properti';
      default: return type;
    }
  };

  return (
    <div className="bg-[#181e5a]/80 rounded-2xl white-shadow p-6">
      <h3 className="font-title text-xl text-[#7ffcff] mb-6 flex items-center">
        <Shield className="w-6 h-6 mr-2" />
        Marketplace Asuransi
      </h3>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterTypes.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedType(filter.value)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-body transition-all duration-200 ${
              selectedType === filter.value
                ? 'bg-[#7ffcff] text-[#181e5a] font-semibold'
                : 'bg-[#2e3192]/30 text-white hover:bg-[#2e3192]/50'
            }`}
          >
            {filter.icon}
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`bg-[#2e3192]/30 rounded-lg p-4 hover:bg-[#2e3192]/50 transition-all duration-200 cursor-pointer group relative ${
              product.recommended ? 'ring-2 ring-[#7ffcff]/50' : ''
            }`}
          >
            {/* Recommended Badge */}
            {product.recommended && (
              <div className="absolute -top-2 -right-2 bg-[#7ffcff] text-[#181e5a] text-xs font-title px-2 py-1 rounded-full">
                Direkomendasikan
              </div>
            )}

            {/* Product Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2 text-[#7ffcff]">
                {product.icon}
                <div>
                  <h4 className="font-title text-white text-sm group-hover:text-[#7ffcff] transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs text-white/60 font-body">{product.provider}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-body capitalize ${getTypeColor(product.type)}`}>
                {getTypeLabel(product.type)}
              </span>
            </div>

            {/* Product Description */}
            <p className="text-white/70 text-xs font-body mb-3 line-clamp-2">
              {product.description}
            </p>

            {/* Key Features */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {product.keyFeatures.slice(0, 2).map((feature, index) => (
                  <span
                    key={index}
                    className="text-xs bg-[#7ffcff]/20 text-[#7ffcff] px-2 py-1 rounded font-body"
                  >
                    {feature}
                  </span>
                ))}
                {product.keyFeatures.length > 2 && (
                  <span className="text-xs text-white/60 font-body">
                    +{product.keyFeatures.length - 2} more
                  </span>
                )}
              </div>
            </div>

            {/* Product Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div>
                <div className="flex items-center space-x-1 text-white/60">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-body">Premi</span>
                </div>
                <div className="text-[#7ffcff] font-title">{formatIDR(product.monthlyPremium)}/bln</div>
              </div>
              <div>
                <div className="flex items-center space-x-1 text-white/60">
                  <Shield className="w-3 h-3" />
                  <span className="font-body">Perlindungan</span>
                </div>
                <div className="text-green-400 font-title">{formatIDR(product.coverage)}</div>
              </div>
            </div>

            {/* Rating and Customers */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-white font-title">{product.rating}</span>
              </div>
              <div className="flex items-center space-x-1 text-white/60">
                <Users className="w-3 h-3" />
                <span className="text-xs font-body">{(product.customers / 1000).toFixed(1)}K pengguna</span>
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full flex items-center justify-center space-x-2 bg-[#7ffcff]/10 hover:bg-[#7ffcff] text-[#7ffcff] hover:text-[#181e5a] py-2 rounded-lg transition-all duration-200 font-body text-sm">
              <span>Lihat Detail</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Marketplace Footer */}
      <div className="mt-6 pt-4 border-t border-[#7ffcff]/20 text-center">
        <p className="text-white/70 text-sm font-body mb-3">
          Butuh bantuan memilih asuransi yang tepat? Dapatkan rekomendasi personal.
        </p>
        <button className="px-6 py-2 bg-[#7ffcff] text-[#181e5a] font-title font-semibold rounded-lg hover:bg-white transition-colors duration-200 white-shadow">
          Konsultasi dengan Ahli
        </button>
      </div>
    </div>
  );
}

function FinancialEducationCard() {
  const articles: Article[] = [
    {
      id: 1,
      title: "Mengapa Asuransi Jiwa adalah Investasi Pertama Anda",
      category: "Asuransi Jiwa",
      readTime: "5 menit",
      difficulty: "beginner",
      description: "Pahami mengapa asuransi jiwa harus menjadi fondasi perencanaan keuangan dan strategi perlindungan kekayaan Anda.",
      url: "#",
      icon: <Heart className="w-5 h-5" />
    },
    {
      id: 2,
      title: "Unit Link: Kombinasi Investasi + Asuransi",
      category: "Investasi Asuransi",
      readTime: "8 menit",
      difficulty: "beginner",
      description: "Pelajari bagaimana Unit Link menawarkan manfaat ganda berupa perlindungan jiwa dan pembangunan kekayaan dalam satu produk.",
      url: "#",
      icon: <Shield className="w-5 h-5" />
    },
    {
      id: 3,
      title: "Asuransi Kesehatan: Melindungi Tabungan Anda",
      category: "Perlindungan Kesehatan",
      readTime: "6 menit",
      difficulty: "beginner",
      description: "Temukan bagaimana asuransi kesehatan komprehensif mencegah darurat medis menghabiskan kekayaan Anda.",
      url: "#",
      icon: <Umbrella className="w-5 h-5" />
    },
    {
      id: 4,
      title: "Asuransi Jiwa Berjangka vs Seumur Hidup",
      category: "Perencanaan Asuransi",
      readTime: "10 menit",
      difficulty: "intermediate",
      description: "Bandingkan berbagai jenis asuransi jiwa dan pilih perlindungan yang tepat untuk kebutuhan keluarga Anda.",
      url: "#",
      icon: <Target className="w-5 h-5" />
    },
    {
      id: 5,
      title: "Asuransi Properti: Perlindungan Aset",
      category: "Perlindungan Aset",
      readTime: "7 menit",
      difficulty: "intermediate",
      description: "Pelajari bagaimana asuransi rumah dan kendaraan melindungi aset fisik dari kerugian tak terduga.",
      url: "#",
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 6,
      title: "Manfaat Pajak Asuransi & Strategi",
      category: "Perencanaan Pajak",
      readTime: "12 menit",
      difficulty: "advanced",
      description: "Maksimalkan penghematan pajak melalui penggunaan strategis produk asuransi dan pembayaran premi.",
      url: "#",
      icon: <DollarSign className="w-5 h-5" />
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-300';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300';
      case 'advanced': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '⚪';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Pemula';
      case 'intermediate': return 'Menengah';
      case 'advanced': return 'Lanjutan';
      default: return difficulty;
    }
  };

  return (
    <div className="bg-[#181e5a]/80 rounded-2xl white-shadow p-6">
      <h3 className="font-title text-xl text-[#7ffcff] mb-6 flex items-center">
        <BookOpen className="w-6 h-6 mr-2" />
        Pusat Pembelajaran Asuransi & Perlindungan Kekayaan
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <div 
            key={article.id}
            className="bg-[#2e3192]/30 rounded-lg p-4 hover:bg-[#2e3192]/50 transition-all duration-200 cursor-pointer group"
          >
            {/* Article Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2 text-[#7ffcff]">
                {article.icon}
                <span className="text-xs font-body text-white/60">{article.category}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-[#7ffcff] transition-colors" />
            </div>

            {/* Article Title */}
            <h4 className="font-title text-white text-sm mb-2 group-hover:text-[#7ffcff] transition-colors">
              {article.title}
            </h4>

            {/* Article Description */}
            <p className="text-white/70 text-xs font-body mb-3 line-clamp-3">
              {article.description}
            </p>

            {/* Article Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-white/60">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-body">{article.readTime}</span>
                </div>
              </div>
              
              <div className={`px-2 py-1 rounded-full text-xs font-body flex items-center space-x-1 ${getDifficultyColor(article.difficulty)}`}>
                <span>{getDifficultyIcon(article.difficulty)}</span>
                <span className="capitalize">{getDifficultyLabel(article.difficulty)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-6 text-center">
        <p className="text-white/70 text-sm font-body mb-3">
          Siap melindungi dan mengembangkan kekayaan dengan asuransi?
        </p>
        <button className="px-6 py-2 bg-[#7ffcff] text-[#181e5a] font-title font-semibold rounded-lg hover:bg-white transition-colors duration-200 white-shadow">
          Jelajahi Solusi Asuransi
        </button>
      </div>
    </div>
  );
}

function SummaryPageInner() {
  const { user, loading, login, logout } = useAuth();
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalAssets: 2250000000, // 2.25 Miliar IDR
    totalLiabilities: 675000000, // 675 Juta IDR
    monthlyIncome: 127500000, // 127.5 Juta IDR per bulan
    monthlyExpenses: 93000000, // 93 Juta IDR per bulan
    emergencyFund: 270000000, // 270 Juta IDR
    investments: 1275000000, // 1.275 Miliar IDR
    lifeInsurance: 15300000000, // 15.3 Miliar IDR (12x annual income)
    healthInsurance: true,
    propertyInsurance: 2250000000, // 2.25 Miliar IDR
    insurancePremiums: 12750000 // 12.75 Juta IDR per bulan
  });

  // Calculate health score based on financial data
  const calculateHealthScore = (data: FinancialData): HealthScore => {
    const netWorth = data.totalAssets - data.totalLiabilities;
    const monthlyCashflow = data.monthlyIncome - data.monthlyExpenses;
    const savingsRate = data.monthlyIncome > 0 ? (monthlyCashflow / data.monthlyIncome) * 100 : 0;
    const emergencyMonths = data.monthlyExpenses > 0 ? data.emergencyFund / data.monthlyExpenses : 0;
    const debtToIncomeRatio = data.monthlyIncome > 0 ? (data.totalLiabilities / (data.monthlyIncome * 12)) * 100 : 0;
    
    // Insurance protection assessment
    const annualIncome = data.monthlyIncome * 12;
    const lifeInsuranceRatio = annualIncome > 0 ? (data.lifeInsurance / annualIncome) : 0;
    const hasHealthInsurance = data.healthInsurance ? 100 : 0;
    const propertyProtected = data.propertyInsurance > 0 ? 80 : 0;
    
    // Calculate individual factor scores
    const savingsScore = Math.min(Math.max(savingsRate * 5, 0), 100);
    const debtScore = Math.min(Math.max(100 - debtToIncomeRatio, 0), 100);
    const emergencyScore = Math.min(Math.max(emergencyMonths * 16.67, 0), 100); // 6 months = 100%
    const insuranceScore = Math.min(Math.max((lifeInsuranceRatio * 8) + (hasHealthInsurance * 0.3) + (propertyProtected * 0.2), 0), 100);

    // Overall score (weighted towards insurance protection)
    const overallScore = Math.round((savingsScore + debtScore + emergencyScore + insuranceScore) / 4);

    // Determine category
    let category: 'fragile' | 'stable' | 'strong';
    if (overallScore < 40) category = 'fragile';
    else if (overallScore < 70) category = 'stable';
    else category = 'strong';

    return {
      score: overallScore,
      category,
      factors: {
        savings: Math.round(savingsScore),
        debt: Math.round(debtScore),
        emergency: Math.round(emergencyScore),
        insurance: Math.round(insuranceScore)
      }
    };
  };

  const healthScore = calculateHealthScore(financialData);

  if (loading) return <div className="text-center py-12 font-body">Loading...</div>;
  
  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: 'linear-gradient(90deg, #181e5a 0%, #2e3192 50%, #6dd5fa 100%)' }}>
      <h2 className="text-3xl font-title mb-4 text-[#7ffcff] drop-shadow-[0_4px_24px_rgba(255,255,255,0.7)]">Masuk untuk melihat ringkasan</h2>
      <button onClick={login} className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 white-shadow font-body">
        Masuk dengan Google
      </button>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: 'linear-gradient(90deg, #181e5a 0%, #2e3192 50%, #6dd5fa 100%)' }}>
      {/* Top Navigation Bar */}
      <div className="bg-transparent py-6">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-4xl font-title text-[#7ffcff] drop-shadow-[0_4px_24px_rgba(255,255,255,0.7)]">
            🛡️ Ringkasan Perlindungan Kekayaan
          </h1>
          <UserAvatarDropdown user={user} logout={logout} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 flex-1">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Score - Takes full width on mobile, left column on desktop */}
          <div className="lg:col-span-1">
            <HealthScoreCard score={healthScore} />
          </div>

          {/* Financial Overview - Takes remaining space */}
          <div className="lg:col-span-2">
            <FinancialOverviewCard data={financialData} />
          </div>

          {/* Recommendations - Full width */}
          <div className="lg:col-span-3">
            <RecommendationsCard />
          </div>

          {/* Investment Forecast - Full width */}
          <div className="lg:col-span-3">
            <InvestmentForecastChart data={financialData} />
          </div>

          {/* Insurance Marketplace - Full width */}
          <div className="lg:col-span-3">
            <InsuranceMarketplace />
          </div>

          {/* Financial Education - Full width */}
          <div className="lg:col-span-3">
            <FinancialEducationCard />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center space-x-4">
          <a 
            href="/chat" 
            className="px-6 py-3 bg-[#7ffcff] text-[#181e5a] font-title font-semibold rounded-lg hover:bg-[#2e3192] hover:text-white transition-colors duration-200 white-shadow"
          >
            Kembali ke Chat
          </a>
          <a 
            href="/admin" 
            className="px-6 py-3 bg-[#2e3192]/80 text-white font-title font-semibold rounded-lg hover:bg-[#181e5a] transition-colors duration-200 white-shadow"
          >
            Panel Admin
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <AuthProvider>
      <SummaryPageInner />
    </AuthProvider>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Search, Users, Activity, Calendar, Mail, User, X, Edit, DollarSign, MapPin, Calendar as CalendarIcon, UserCheck } from 'lucide-react';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
}

interface User {
  id: number;
  firebase_uid: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  chat_count: number;
  last_activity: string | null;
}

interface UserFinancialInfo {
  id: number;
  user_id: number;
  gender: string | null;
  birthdate: string | null;
  estimated_salary: number | null;
  country: string | null;
  domicile: string | null;
  active_loan: number | null;
  bi_checking_status: string | null;
  created_at: string;
  updated_at: string;
}

interface UserDetails {
  id: number;
  firebase_uid: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  user_created_at: string;
  financial_info_id?: number;
  user_id?: number;
  gender?: string | null;
  birthdate?: string | null;
  estimated_salary?: number | null;
  country?: string | null;
  domicile?: string | null;
  active_loan?: number | null;
  bi_checking_status?: string | null;
  financial_info_created_at?: string;
  financial_info_updated_at?: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [extractingFinancialData, setExtractingFinancialData] = useState(false);
  const [extractionMessage, setExtractionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const usersPerPage = 10;

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * usersPerPage;
      const response = await fetch(
        `/api/admin/users?search=${encodeURIComponent(searchTerm)}&limit=${usersPerPage}&offset=${offset}`
      );
      const data = await response.json();
      setUsers(data.users);
      setTotalCount(data.totalCount);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: number) => {
    console.log('Fetching user details for ID:', userId);
    setLoadingUserDetails(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();
      if (response.ok) {
        console.log('User details received:', data.user);
        console.log('User ID from response:', data.user.id);
        console.log('Full user object:', JSON.stringify(data.user, null, 2));
        setSelectedUser(data.user);
        setShowUserModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const extractFinancialData = async (userId: number) => {
    if (!userId || isNaN(userId)) {
      setExtractionMessage({
        type: 'error',
        text: 'Invalid user ID. Please try again.'
      });
      return;
    }

    setExtractingFinancialData(true);
    setExtractionMessage(null);
    
    try {
      const response = await fetch(`/api/admin/users/${userId}/extract-financial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setExtractionMessage({
          type: 'success',
          text: 'Financial data extracted successfully! Refreshing user details...'
        });
        
        // Refresh user details to show the extracted data
        setTimeout(() => {
          fetchUserDetails(userId);
        }, 1500);
      } else {
        setExtractionMessage({
          type: 'error',
          text: data.error || 'Failed to extract financial data'
        });
      }
    } catch (error) {
      setExtractionMessage({
        type: 'error',
        text: 'Network error occurred while extracting data'
      });
    } finally {
      setExtractingFinancialData(false);
    }
  };

  const handleUserClick = (user: User) => {
    console.log('User clicked:', user);
    fetchUserDetails(user.id);
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBIStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(90deg, #181e5a 0%, #2e3192 50%, #6dd5fa 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7ffcff] mx-auto"></div>
          <p className="mt-4 text-[#7ffcff] font-body">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(90deg, #181e5a 0%, #2e3192 50%, #6dd5fa 100%)' }}>
      {/* Header */}
      <div className="bg-transparent py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-title text-[#7ffcff] drop-shadow-[0_4px_24px_rgba(255,255,255,0.7)]">Admin Dashboard</h1>
          <p className="mt-2 text-white font-body">Monitor user activity and manage your application</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#2e3192]/80 rounded-2xl white-shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#7ffcff]/20 text-[#7ffcff] white-shadow">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-body text-[#7ffcff]">Total Users</p>
                <p className="text-2xl font-title text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2e3192]/80 rounded-2xl white-shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#7ffcff]/20 text-[#7ffcff] white-shadow">
                <Activity className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-body text-[#7ffcff]">Active Users (7 days)</p>
                <p className="text-2xl font-title text-white">{stats.activeUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-[#181e5a]/80 rounded-2xl white-shadow">
          <div className="px-6 py-4 border-b border-[#7ffcff]/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-title text-[#7ffcff] mb-4 sm:mb-0">Users</h2>
              <div className="relative">
                <Search className="absolute left-0.5 top-1/2 transform -translate-y-1/2 text-[#7ffcff] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-[#7ffcff]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7ffcff] focus:border-transparent font-body bg-white/90 text-[#181e5a]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#7ffcff]/20">
              <thead className="bg-[#2e3192]/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-title text-[#7ffcff] uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-title text-[#7ffcff] uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-title text-[#7ffcff] uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-title text-[#7ffcff] uppercase tracking-wider">Chats</th>
                  <th className="px-6 py-3 text-left text-xs font-title text-[#7ffcff] uppercase tracking-wider">Last Activity</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-[#7ffcff]/10">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7ffcff] mx-auto"></div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-[#7ffcff] font-body">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-[#7ffcff]/10 cursor-pointer transition-colors duration-150"
                      onClick={() => handleUserClick(user)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar_url ? (
                              <img className="h-10 w-10 rounded-full white-shadow" src={user.avatar_url} alt={user.name || 'User'} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-[#7ffcff]/20 flex items-center justify-center white-shadow">
                                <User className="w-5 h-5 text-[#7ffcff]" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-title text-white">{user.name || 'No name'}</div>
                            <div className="text-sm text-[#7ffcff] font-body truncate w-32" title={`ID: ${user.id}`}>ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-[#7ffcff] mr-2" />
                          <span className="text-sm text-white font-body truncate w-40" title={user.email}>{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7ffcff] font-body">{formatDate(user.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-title bg-[#7ffcff]/20 text-[#7ffcff]">{user.chat_count}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7ffcff] font-body">{user.last_activity ? formatDate(user.last_activity) : 'Never'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-[#7ffcff]/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white font-body">
                Showing {((currentPage - 1) * usersPerPage) + 1} to{' '}
                {Math.min(currentPage * usersPerPage, totalCount)} of {totalCount} users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-[#7ffcff]/40 rounded-md hover:bg-[#7ffcff]/10 disabled:opacity-50 disabled:cursor-not-allowed white-shadow font-title"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!hasMore}
                  className="px-3 py-1 text-sm border border-[#7ffcff]/40 rounded-md hover:bg-[#7ffcff]/10 disabled:opacity-50 disabled:cursor-not-allowed white-shadow font-title"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#181e5a] rounded-2xl white-shadow max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#7ffcff]/30 flex justify-between items-center">
              <h2 className="text-xl font-title text-[#7ffcff]">User Financial Information</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-[#7ffcff] hover:text-white transition-colors font-title"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {loadingUserDetails ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7ffcff] mx-auto"></div>
                  <p className="mt-2 text-[#7ffcff] font-body">Loading user details...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Debug Info */}
                  <div className="text-xs text-[#7ffcff] font-body">Debug: User ID = {selectedUser.id || 'No ID'}</div>

                  {/* Basic Info */}
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-16 w-16">
                      {selectedUser.avatar_url ? (
                        <img className="h-16 w-16 rounded-full white-shadow" src={selectedUser.avatar_url} alt={selectedUser.name || 'User'} />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-[#7ffcff]/20 flex items-center justify-center white-shadow">
                          <User className="w-8 h-8 text-[#7ffcff]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-title text-white">{selectedUser.name || 'No name'}</h3>
                      <p className="text-sm text-[#7ffcff] font-body truncate w-40" title={selectedUser.email}>{selectedUser.email}</p>
                      <p className="text-xs text-[#7ffcff] font-body">ID: {selectedUser.id}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => {
                          console.log('Extract button clicked. Selected user:', selectedUser);
                          console.log('Selected user ID:', selectedUser.id);
                          if (selectedUser.id) {
                            extractFinancialData(selectedUser.id);
                          } else {
                            setExtractionMessage({
                              type: 'error',
                              text: 'User ID not available. Please try again.'
                            });
                          }
                        }}
                        disabled={extractingFinancialData}
                        className="flex items-center space-x-2 px-4 py-2 bg-[#7ffcff] text-[#181e5a] rounded-lg hover:bg-[#2e3192] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors white-shadow font-title"
                      >
                        {extractingFinancialData ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Extracting...</span>
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4" />
                            <span>Extract Financial Data</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Extraction Message */}
                  {extractionMessage && (
                    <div className={`p-4 rounded-lg ${
                      extractionMessage.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <p className="text-sm font-body">{extractionMessage.text}</p>
                    </div>
                  )}

                  {/* Financial Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <UserCheck className="w-5 h-5 text-[#7ffcff]" />
                        <div>
                          <p className="text-sm font-title text-[#7ffcff]">Gender</p>
                          <p className="text-sm text-white font-body">{selectedUser.gender || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="w-5 h-5 text-[#7ffcff]" />
                        <div>
                          <p className="text-sm font-title text-[#7ffcff]">Birthdate</p>
                          <p className="text-sm text-white font-body">{selectedUser.birthdate ? new Date(selectedUser.birthdate).toLocaleDateString() : 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-[#7ffcff]" />
                        <div>
                          <p className="text-sm font-title text-[#7ffcff]">Estimated Salary</p>
                          <p className="text-sm text-white font-body">{formatCurrency(selectedUser.estimated_salary ?? null)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-[#7ffcff]" />
                        <div>
                          <p className="text-sm font-title text-[#7ffcff]">Country</p>
                          <p className="text-sm text-white font-body">{selectedUser.country || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-[#7ffcff]" />
                        <div>
                          <p className="text-sm font-title text-[#7ffcff]">Domicile</p>
                          <p className="text-sm text-white font-body">{selectedUser.domicile || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 text-[#7ffcff] flex items-center justify-center">
                          <span className="text-lg">💰</span>
                        </div>
                        <div>
                          <p className="text-sm font-title text-[#7ffcff]">Active Loans</p>
                          <p className="text-sm text-white font-body">{formatCurrency(selectedUser.active_loan ?? null)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 text-[#7ffcff] flex items-center justify-center">
                          <span className="text-lg">🏦</span>
                        </div>
                        <div>
                          <p className="text-sm font-title text-[#7ffcff]">BI Checking Status</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-title ${getBIStatusColor(selectedUser.bi_checking_status ?? null)}`}>{selectedUser.bi_checking_status || 'Not checked'}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-[#7ffcff]" />
                        <div>
                          <p className="text-sm font-title text-[#7ffcff]">Member Since</p>
                          <p className="text-sm text-white font-body">{formatDate(selectedUser.user_created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* No Financial Info Message */}
                  {!selectedUser.financial_info_id && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <span className="text-yellow-400">⚠️</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-800 font-body">No financial information has been provided by this user yet. Click "Extract Financial Data" to analyze their chat history.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#7ffcff]/30 flex justify-end">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-[#7ffcff] text-[#181e5a] rounded-lg hover:bg-[#2e3192] hover:text-white transition-colors white-shadow font-title"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
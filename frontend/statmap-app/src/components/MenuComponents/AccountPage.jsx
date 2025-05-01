import React, { useContext, useEffect, useState } from 'react';
import { SupabaseContext } from '../SupabaseContext';
import { motion } from 'framer-motion';
import {
  User,
  Trophy,
  Clock,
  Calendar,
  Mail,
  CheckCircle,
  Shield,
  History,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const AccountPage = ({ isOpen, onModalClose }) => {
  const [hoveredSection, setHoveredSection] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [account, setAccount] = useState(null);
  const [gameLogs, setGameLogs] = useState([]);
  const [accountStats, setAccountStats] = useState(null);

  const supabase = useContext(SupabaseContext);

  async function getAccount() {
    const tempAccount = await supabase.auth.getUser();
    setAccount(tempAccount);
    console.log(tempAccount);

    if (tempAccount && tempAccount.data.user) {
      getGameLogs(tempAccount.data.user.id);
      getAccountStats(tempAccount.data.user.id);
    }
  }

  async function getGameLogs(user_id) {
    let { data, error } = await supabase
      .from('Game Logs')
      .select('*')
      .eq('User_ID', user_id)
      .limit(25)

    if (error) {
      // alert(error);
      console.log(error);
    } else {
      setGameLogs(data.sort((a, b) => b.Start_Time - a.End_Time));
    }
  }

  async function getAccountStats(user_id) {
    let { data, error } = await supabase.rpc('account_stats', {
      user_id: String(user_id),
    });

    if (error) {
      console.log(error);
    } else {
      setAccountStats(data[0]);
    }
  }

  useEffect(() => {
    getAccount();
  }, []);

  // Calculate game duration in a readable format
  const calculateDuration = (startTime, endTime) => {
    const start = startTime;
    const end = endTime;
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    if (diffMins > 0) {
      return `${diffMins}m ${diffSecs}s`;
    }
    return `${diffSecs}s`;
  };

  const changePassword = async () => {
    await supabase.auth.resetPasswordForEmail(account.data.user.user_metadata.email, {
      redirectTo: 'https://statmap.world/#/changepassword',
    })
    alert("An email has been sent to reset your password");
  }

  if (!account || !account.data.user) {
    return (
      <div className="w-full max-w-md mx-auto py-12 px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-zinc-900/60 rounded-lg p-8 backdrop-blur-sm">
            <User className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <h2 className="text-xl font-medium text-white mb-2">
              Sign In Required
            </h2>
            <p className="text-white/60 mb-6">
              Please sign in to view your account information and statistics.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 text-white">
      {/* <motion.div
        className="my-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="mt-2 text-white text-3xl font-bold">Account Dashboard</p>
      </motion.div> */}

      {/* Tab navigation */}
      <motion.div
        className="flex space-x-2 mb-6 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'px-4 py-2 rounded-lg transition-all duration-300',
            activeTab === 'overview'
              ? 'bg-zinc-900/80 text-white border border-white/10'
              : 'bg-zinc-900/40 text-white/70 border border-white/10 hover:bg-zinc-800/60 hover:text-white/90'
          )}
        >
          <div className="flex items-center gap-2">
            <User size={16} />
            <span>Overview</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'px-4 py-2 rounded-lg transition-all duration-300',
            activeTab === 'history'
              ? 'bg-zinc-900/80 text-white border border-white/10'
              : 'bg-zinc-900/40 text-white/70 border border-white/10 hover:bg-zinc-800/60 hover:text-white/90'
          )}
        >
          <div className="flex items-center gap-2">
            <History size={16} />
            <span>Game History</span>
          </div>
        </button>
      </motion.div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Stats Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Account Info Card */}
            <div
              className={cn(
                'relative overflow-hidden border border-white/10 rounded-lg transition-all duration-300 bg-zinc-900/40 p-5',
                hoveredSection === 'account' ? 'bg-zinc-900/60' : ''
              )}
              onMouseEnter={() => setHoveredSection('account')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br from-sky-500/5 to-blue-500/5 opacity-0 transition-opacity duration-300',
                  hoveredSection === 'account' && 'opacity-100'
                )}
              />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                    <User size={20} />
                  </div>
                  <h3 className="text-lg font-medium">Account Info</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white/80">
                    <User size={16} className="text-white/40" />
                    <span className="text-white/60">Display Name:</span>
                    <span className="font-medium">
                      {account.data.user.user_metadata.display_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Mail size={16} className="text-white/40" />
                    <span className="text-white/60">Email:</span>
                    <span className="font-medium">
                      {account.data.user.user_metadata.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <CheckCircle size={16} className="text-white/40" />
                    <span className="text-white/60">Email Verified:</span>
                    <span className="font-medium">
                      {account.data.user.user_metadata.email_verified
                        ? 'Yes'
                        : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Calendar size={16} className="text-white/40" />
                    <span className="text-white/60">Created On:</span>
                    <span className="font-medium">
                      {new Date(
                        account.data.user.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div
              className={cn(
                'relative overflow-hidden border border-white/10 rounded-lg transition-all duration-300 bg-zinc-900/40 p-5',
                hoveredSection === 'stats' ? 'bg-zinc-900/60' : ''
              )}
              onMouseEnter={() => setHoveredSection('stats')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300',
                  hoveredSection === 'stats' && 'opacity-100'
                )}
              />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Trophy size={20} />
                  </div>
                  <h3 className="text-lg font-medium">Game Stats</h3>
                </div>

                {accountStats && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Games Played</span>
                      <span className="font-medium text-white">
                        {accountStats.Total_Games_Played}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Average Score</span>
                      <span className="font-medium text-white">
                        {accountStats.Avg_Score}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">High Score</span>
                      <span className="font-medium text-sky-400">
                        {accountStats.High_Score}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Correct Answers</span>
                      <span className="font-medium text-white">
                        {accountStats.Total_Correct} /{' '}
                        {accountStats.Total_Questions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Accuracy</span>
                      <span className="font-medium text-white">
                        {(
                          (accountStats.Total_Correct /
                            accountStats.Total_Questions) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Management Card */}
            <div
              className={cn(
                'relative overflow-hidden border border-white/10 rounded-lg transition-all duration-300 bg-zinc-900/40 p-5',
                hoveredSection === 'management' ? 'bg-zinc-900/60' : ''
              )}
              onMouseEnter={() => setHoveredSection('management')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 transition-opacity duration-300',
                  hoveredSection === 'management' && 'opacity-100'
                )}
              />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Shield size={20} />
                  </div>
                  <h3 className="text-lg font-medium">Account Management</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-white/60 text-sm">
                    Manage your account settings and security preferences.
                  </p>

                  <button onClick={changePassword} className="w-full py-2 px-3 bg-zinc-800/80 hover:bg-zinc-700/80 text-white/80 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <span>Reset Password</span>
                    <ArrowRight size={14} />
                  </button>

                  {/* <button className="w-full py-2 px-3 bg-zinc-800/80 hover:bg-zinc-700/80 text-white/80 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <span>Update Profile</span>
                    <ArrowRight size={14} />
                  </button> */}

                  <div className="pt-2">
                    <p className="text-xs text-white/40 text-center">
                      More account management options coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Games */}
          <motion.div variants={itemVariants}>
            <div
              className={cn(
                'relative overflow-hidden border border-white/10 rounded-lg transition-all duration-300 bg-zinc-900/40',
                hoveredSection === 'recent' ? 'bg-zinc-900/60' : ''
              )}
              onMouseEnter={() => setHoveredSection('recent')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-r from-sky-500/5 to-blue-500/5 opacity-0 transition-opacity duration-300',
                  hoveredSection === 'recent' && 'opacity-100'
                )}
              />

              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <History size={18} className="text-white/60" />
                  Recent Games
                </h2>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-sm text-white/60 hover:text-white flex items-center gap-1 transition-colors z-20"
                >
                  <span>View All</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Mode
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider">
                        Correct
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameLogs.slice(0, 5).map((game, index) => (
                      <tr
                        key={game.Game_ID}
                        className={cn(
                          'transition-colors',
                          index % 2 === 0 ? 'bg-zinc-900/20' : 'bg-zinc-900/40',
                          'hover:bg-zinc-800/60'
                        )}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {new Date(game.Start_Time).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {game.Mode}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {
                            accountStats && (
                              <span
                                className={cn(
                                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                  game.Score === accountStats.High_Score
                                    ? 'bg-yellow-500/20 text-yellow-300'
                                    : 'bg-sky-500/10 text-sky-400'
                                )}
                              >
                                {game.Score}
                              </span>)
                          }
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap text-sm">
                          {game.Num_Correct} / {game.Num_Questions}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-white/60 flex items-center justify-end gap-1">
                          <Clock size={14} className="text-white/40" />
                          {calculateDuration(game.Start_Time, game.End_Time)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Game History Tab */}
      {activeTab === 'history' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <div
              className={cn(
                'relative overflow-hidden border border-white/10 rounded-lg transition-all duration-300 bg-zinc-900/40',
                hoveredSection === 'history' ? 'bg-zinc-900/60' : ''
              )}
              onMouseEnter={() => setHoveredSection('history')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-r from-sky-500/5 to-blue-500/5 opacity-0 transition-opacity duration-300',
                  hoveredSection === 'history' && 'opacity-100'
                )}
              />

              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <History size={18} className="text-white/60" />
                  Game History
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Mode
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider">
                        Correct
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider">
                        Hints Used
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {gameLogs.map((game, index) => (
                      <tr
                        key={game.Game_ID}
                        className={cn(
                          'transition-colors',
                          index % 2 === 0 ? 'bg-zinc-900/20' : 'bg-zinc-900/40',
                          'hover:bg-zinc-800/60'
                        )}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {new Date(game.Start_Time).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {game.Mode}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {
                            accountStats && (
                              <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                game.Score === accountStats.High_Score
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-sky-500/10 text-sky-400'
                              )}
                            >
                              {game.Score}
                            </span>)
                          }
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap text-sm">
                          {game.Num_Correct} / {game.Num_Questions}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap text-sm">
                          {game.Hint_One_Used +
                            game.Hint_Two_Used +
                            game.Hint_Three_Used}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap text-sm text-white/60 flex items-center justify-end gap-1">
                          <Clock size={14} className="text-white/40" />
                          {calculateDuration(game.Start_Time, game.End_Time)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AccountPage;

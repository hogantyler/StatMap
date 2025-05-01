import { useContext, useEffect, useState } from 'react';
import { SupabaseContext } from './SupabaseContext';
import { FaTimes } from 'react-icons/fa';
import {
  ArrowRight,
  Trophy,
  Medal,
  Award,
  Star,
  Crown,
  Users,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

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

const Leaderboard = ({ onModalClose }) => {
  const [activeTab, setActiveTab] = useState('highScore');
  const [hoveredCard, setHoveredCard] = useState(null);

  const supabase = useContext(SupabaseContext);
  const [topFive, setTopFive] = useState(null);
  const [avgScore, setAvgScore] = useState(null);

  async function getTopFiveQuizMode() {
    let { data, error } = await supabase
      .from('Game Logs')
      .select('*')
      .limit(5)
      .order('Score', { ascending: false });

    if (error) {
      alert(error);
    } else {
      // console.log(data);
      setTopFive(data);
    }
  }

  async function getTopFiveAvgScore() {
    let { data, error } = await supabase.rpc('avg_score');

    if (error) {
      alert(error);
    } else {
      // console.log(data);
      setAvgScore(data);
    }
  }

  useEffect(() => {
    getTopFiveQuizMode();
    getTopFiveAvgScore();
  }, []);

  // Helper function to get rank icon
  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="text-yellow-400" size={24} />;
      case 1:
        return <Medal className="text-gray-300" size={24} />;
      case 2:
        return <Award className="text-amber-600" size={24} />;
      default:
        return <Trophy className="text-zinc-600" size={24} />;
    }
  };

  return (
    <div className="relative w-full text-white mx-3 border border-transparent rounded-xl">
      {/* Main content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-4 sm:px-6">
        {/* <motion.div
          className="my-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mt-4 text-white text-4xl font-bold sm:text-xl max-w-md mx-auto">
            Global Leaderboards
          </p>
        </motion.div> */}

        <div className="w-full max-w-4xl">
          {/* Tab navigation */}
          <motion.div
            className="flex space-x-2 mb-8 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <button
              onClick={() => setActiveTab('highScore')}
              className={cn(
                'px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2',
                activeTab === 'highScore'
                  ? 'bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-white border border-sky-500/30'
                  : 'bg-zinc-900/40 text-white/70 border border-white/10 hover:bg-zinc-800/60 hover:text-white/90'
              )}
            >
              <Trophy size={18} />
              <span>High Scores</span>
            </button>
            <button
              onClick={() => setActiveTab('averageScore')}
              className={cn(
                'px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2',
                activeTab === 'averageScore'
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30'
                  : 'bg-zinc-900/40 text-white/70 border border-white/10 hover:bg-zinc-800/60 hover:text-white/90'
              )}
            >
              <BarChart3 size={18} />
              <span>Average Scores</span>
            </button>
          </motion.div>

          {/* High Score Cards */}
          {activeTab === 'highScore' && topFive && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4"
            >
              {/* Top player highlight */}
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 to-blue-950/40 backdrop-blur-sm p-6"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16" />

                <div className="relative flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center">
                    <Crown className="text-yellow-400" size={40} />
                  </div>

                  <div className="flex-grow text-center sm:text-left">
                    <div className="text-sm text-sky-400 font-medium uppercase tracking-wider mb-1">
                      Top Player
                    </div>
                    <h3 className="text-2xl font-bold">
                      {topFive[0].Display_Name}
                    </h3>
                    <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-4">
                      <div className="bg-sky-500/10 rounded-lg px-3 py-1">
                        <div className="text-xs text-sky-400 uppercase">
                          Score
                        </div>
                        <div className="text-xl font-bold text-white">
                          {topFive[0].Score}
                        </div>
                      </div>
                      <div className="bg-blue-500/10 rounded-lg px-3 py-1">
                        <div className="text-xs text-blue-400 uppercase">
                          Correct
                        </div>
                        <div className="text-xl font-bold text-white">
                          {topFive[0].Num_Correct}
                        </div>
                      </div>
                      {/* <div className="bg-indigo-500/10 rounded-lg px-3 py-1">
                        <div className="text-xs text-indigo-400 uppercase">Date</div>
                        <div className="text-sm font-medium text-white">
                          {new Date(topFive[0].End_Time).toLocaleDateString()}
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Other top players */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topFive.slice(1).map((score, index) => (
                  <motion.div
                    key={score.Game_ID}
                    variants={itemVariants}
                    className={cn(
                      'relative overflow-hidden rounded-lg border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-4 transition-all duration-300',
                      hoveredCard === index
                        ? 'bg-zinc-900/60 border-white/20 transform scale-[1.02]'
                        : ''
                    )}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>

                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div className="mx-3">
                            <h3 className="font-medium text-lg">
                              {score.Display_Name}
                            </h3>
                            <p className="text-white/60 text-sm">
                              Rank #{index + 2}
                            </p>
                          </div>
                          <div className="bg-sky-500/10 rounded-lg px-2 py-1">
                            <div className="text-xs text-sky-400 uppercase">
                              Score
                            </div>
                            <div className="text-lg font-bold text-white text-center">
                              {score.Score}
                            </div>
                          </div>
                        </div>

                        {/* <div className="mt-2 flex justify-between items-center">
                          <div className="text-sm text-white/60">
                            <span className="text-white/80">{score.Num_Correct}</span> correct answers
                          </div>
                          <div className="text-xs text-white/40">{new Date(score.End_Time).toLocaleDateString()}</div>
                        </div> */}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Average Score Cards */}
          {activeTab === 'averageScore' && avgScore && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4"
            >
              {/* Top average player highlight */}
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 to-purple-950/40 backdrop-blur-sm p-6"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16" />

                <div className="relative flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <Star className="text-yellow-400" size={40} />
                  </div>

                  <div className="flex-grow text-center sm:text-left">
                    <div className="text-sm text-indigo-400 font-medium uppercase tracking-wider mb-1">
                      Top Average
                    </div>
                    <h3 className="text-2xl font-bold">
                      {avgScore[0].Display_Name}
                    </h3>
                    <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-4">
                      <div className="bg-indigo-500/10 rounded-lg px-3 py-1">
                        <div className="text-xs text-indigo-400 uppercase">
                          Avg Score
                        </div>
                        <div className="text-xl font-bold text-white">
                          {avgScore[0].Average_Score}
                        </div>
                      </div>
                      <div className="bg-purple-500/10 rounded-lg px-3 py-1">
                        <div className="text-xs text-purple-400 uppercase">
                          Games
                        </div>
                        <div className="text-xl font-bold text-white">
                          {avgScore[0].Total_Games_Played}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Other average players */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {avgScore.slice(1).map((record, index) => (
                  <motion.div
                    key={record.User_ID}
                    variants={itemVariants}
                    className={cn(
                      'relative overflow-hidden rounded-lg border border-white/10 bg-zinc-900/40 backdrop-blur-sm p-4 transition-all duration-300',
                      hoveredCard === index
                        ? 'bg-zinc-900/60 border-white/20 transform scale-[1.02]'
                        : ''
                    )}
                    onMouseEnter={() => setHoveredCard(index)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>

                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div className="mx-3">
                            <h3 className="font-medium text-lg">
                              {record.Display_Name}
                            </h3>
                            <p className="text-white/60 text-sm">
                              Rank #{index + 2}
                            </p>
                          </div>
                          <div className="bg-indigo-500/10 rounded-lg px-2 py-1">
                            <div className="text-xs text-indigo-400 uppercase">
                              Avg
                            </div>
                            <div className="text-lg font-bold text-white text-center">
                              {record.Average_Score}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 ml-4 flex justify-between items-center">
                          <div className="text-sm text-white/60 flex items-center gap-1">
                            <Users size={14} className="text-white/40" />
                            <span className="text-white/80">
                              {record.Total_Games_Played}
                            </span>{' '}
                            games
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

import React, { useState, useEffect } from "react";
import { Card, Badge, Progress, Spinner, Table } from "flowbite-react";
import { FaTrophy, FaMedal, FaStar, FaHeart, FaCalendarAlt } from "react-icons/fa";
import { useGamification } from "../hooks/gamification";
import { toast } from "react-toastify";

export default function DonorGamification() {
  const { getGamificationData, getLeaderboard, getDonorBadges } = useGamification();
  const [gamificationData, setGamificationData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      const [data, board, badgeList] = await Promise.all([
        getGamificationData(),
        getLeaderboard(),
        getDonorBadges()
      ]);
      setGamificationData(data);
      setLeaderboard(board);
      setBadges(badgeList);
    } catch (error) {
      toast.error("Failed to load gamification data");
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = (points) => {
    const currentLevel = Math.floor(points / 100) + 1;
    const pointsInLevel = points % 100;
    return { currentLevel, pointsInLevel, progress: (pointsInLevel / 100) * 100 };
  };

  const getBadgeIcon = (badgeName) => {
    switch (badgeName) {
      case 'First Time Donor': return <FaHeart className="text-red-500" />;
      case 'Regular Donor': return <FaCalendarAlt className="text-blue-500" />;
      case 'Hero Donor': return <FaTrophy className="text-yellow-500" />;
      case 'Life Saver': return <FaStar className="text-purple-500" />;
      default: return <FaMedal className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  const { currentLevel, pointsInLevel, progress } = getLevelProgress(gamificationData?.points || 0);

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-400 to-red-600 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Donor Achievements</h1>
          <p className="text-red-100">Track your donation impact and earn badges</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white bg-opacity-95 border-red-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{gamificationData?.totalDonations || 0}</div>
              <p className="text-gray-600">Total Donations</p>
            </div>
          </Card>
          <Card className="bg-white bg-opacity-95 border-red-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{gamificationData?.points || 0}</div>
              <p className="text-gray-600">Points Earned</p>
            </div>
          </Card>
          <Card className="bg-white bg-opacity-95 border-red-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{currentLevel}</div>
              <p className="text-gray-600">Current Level</p>
            </div>
          </Card>
          <Card className="bg-white bg-opacity-95 border-red-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{gamificationData?.rank || 'N/A'}</div>
              <p className="text-gray-600">Global Rank</p>
            </div>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="bg-white bg-opacity-95 border-red-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Level Progress</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Level {currentLevel}</span>
              <span className="text-sm text-gray-600">{pointsInLevel}/100 points to next level</span>
            </div>
            <Progress progress={progress} color="red" size="lg" />
            <p className="text-sm text-gray-500">
              Earn {100 - pointsInLevel} more points to reach Level {currentLevel + 1}
            </p>
          </div>
        </Card>

        {/* Badges */}
        <Card className="bg-white bg-opacity-95 border-red-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Badges</h2>
          {badges.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No badges earned yet</p>
              <p className="text-sm text-gray-400 mt-2">Keep donating to earn your first badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {badges.map((badge, index) => (
                <div key={index} className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-3 flex justify-center">
                    {getBadgeIcon(badge)}
                  </div>
                  <h3 className="font-semibold text-gray-800">{badge}</h3>
                  <Badge color="success" className="mt-2">Earned</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Leaderboard */}
        <Card className="bg-white bg-opacity-95 border-red-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Donors Leaderboard</h2>
          <div className="overflow-x-auto">
            <Table>
              <Table.Head>
                <Table.HeadCell>Rank</Table.HeadCell>
                <Table.HeadCell>Donor</Table.HeadCell>
                <Table.HeadCell>Total Donations</Table.HeadCell>
                <Table.HeadCell>Points</Table.HeadCell>
                <Table.HeadCell>Level</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {leaderboard.map((donor, index) => (
                  <Table.Row key={donor.id} className="bg-white">
                    <Table.Cell className="font-medium">
                      {index + 1 === 1 && <FaTrophy className="inline text-yellow-500 mr-2" />}
                      {index + 1 === 2 && <FaMedal className="inline text-gray-400 mr-2" />}
                      {index + 1 === 3 && <FaMedal className="inline text-amber-600 mr-2" />}
                      {index + 1}
                    </Table.Cell>
                    <Table.Cell>
                      {donor.Donor ? `${donor.Donor.firstName} ${donor.Donor.lastName}` : 'Anonymous'}
                    </Table.Cell>
                    <Table.Cell>{donor.totalDonations}</Table.Cell>
                    <Table.Cell>{donor.points}</Table.Cell>
                    <Table.Cell>{donor.level}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}

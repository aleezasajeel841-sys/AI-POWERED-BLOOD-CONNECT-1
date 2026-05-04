import React, { useState, useEffect } from "react";
import { Card, Badge, Button, Spinner, Table } from "flowbite-react";
import { FaHistory, FaCalendarAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { useDonor } from "../hooks/donor";
import { toast } from "react-toastify";

export default function DonorHistory() {
  const { getDonorDonationHistory, toggleEmergencyNotifications } = useDonor();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emergencyEnabled, setEmergencyEnabled] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getDonorDonationHistory();
      setHistory(data);
      setEmergencyEnabled(true); // Assuming default enabled
    } catch (error) {
      toast.error("Failed to load donation history");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEmergency = async () => {
    try {
      await toggleEmergencyNotifications();
      setEmergencyEnabled(!emergencyEnabled);
      toast.success(`Emergency notifications ${!emergencyEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error("Failed to update notification settings");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-400 to-red-600 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Donation History</h1>
          <p className="text-red-100">Track your donation journey and impact</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white bg-opacity-95 border-red-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{history?.totalDonations || 0}</div>
              <p className="text-gray-600">Total Donations</p>
            </div>
          </Card>
          <Card className="bg-white bg-opacity-95 border-red-100">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {history?.lastDonationDate ? new Date(history.lastDonationDate).toLocaleDateString() : 'N/A'}
              </div>
              <p className="text-gray-600">Last Donation</p>
            </div>
          </Card>
          <Card className="bg-white bg-opacity-95 border-red-100">
            <div className="text-center">
              <Button
                onClick={handleToggleEmergency}
                color={emergencyEnabled ? "success" : "gray"}
                className="w-full"
              >
                Emergency Notifications: {emergencyEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Donation History */}
        <Card className="bg-white bg-opacity-95 border-red-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FaHistory className="mr-2" />
              Donation Records
            </h2>
          </div>

          {!history?.donationHistory || history.donationHistory.length === 0 ? (
            <div className="text-center py-8">
              <FaHistory className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No donation history found</p>
              <p className="text-gray-400 mt-2">Your first donation will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.donationHistory.map((donation, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge color="success" className="text-sm">
                          Donation #{history.totalDonations - index}
                        </Badge>
                        <span className="text-gray-600 flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          {new Date(donation.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Blood Type:</span>
                          <span className="ml-2 text-red-600 font-bold">{donation.bloodType || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Units:</span>
                          <span className="ml-2">{donation.units || 1}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Hospital:</span>
                          <span className="ml-2 flex items-center">
                            <FaMapMarkerAlt className="mr-1 text-gray-400" />
                            {donation.hospitalName || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {donation.notes && (
                        <div className="mt-3">
                          <span className="font-semibold text-gray-700">Notes:</span>
                          <p className="text-gray-600 mt-1">{donation.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-6">
                      <Badge color="info" className="text-sm">
                        <FaClock className="mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Impact Summary */}
        {history?.donationHistory && history.donationHistory.length > 0 && (
          <Card className="bg-white bg-opacity-95 border-red-100 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {history.totalDonations}
                </div>
                <p className="text-gray-600">Lives Touched</p>
                <p className="text-sm text-gray-500">Each donation can save up to 3 lives</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.floor((new Date() - new Date(history.donationHistory[0]?.date)) / (1000 * 60 * 60 * 24))}
                </div>
                <p className="text-gray-600">Days Since First Donation</p>
                <p className="text-sm text-gray-500">Your commitment matters</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {history.donationHistory.filter(d => {
                    const donationDate = new Date(d.date);
                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                    return donationDate >= oneYearAgo;
                  }).length}
                </div>
                <p className="text-gray-600">Donations This Year</p>
                <p className="text-sm text-gray-500">Keep up the great work!</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

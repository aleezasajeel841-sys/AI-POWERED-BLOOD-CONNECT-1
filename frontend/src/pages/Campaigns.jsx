import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Spinner, Modal, TextInput, Textarea } from "flowbite-react";
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaHeart, FaCreditCard } from "react-icons/fa";
import { useCampaign } from "../hooks/campaign";
import { usePayment } from "../hooks/payment";
import { toast } from "react-toastify";

export default function Campaigns() {
  const { getCampaigns, registerForCampaign, donateToCampaign } = useCampaign();
  const { createPayment } = usePayment();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("JazzCash");

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (campaignId) => {
    try {
      await registerForCampaign(campaignId);
      toast.success("Successfully registered for campaign!");
      loadCampaigns();
    } catch (error) {
      toast.error("Failed to register for campaign");
    }
  };

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }

    try {
      await donateToCampaign(selectedCampaign.id, {
        amount: parseFloat(donationAmount),
        paymentMethod,
        userId: "current_user_id", // Replace with actual user ID
        userType: "Donor" // or "Receiver"
      });
      toast.success("Donation successful!");
      setShowDonateModal(false);
      setDonationAmount("");
      setSelectedCampaign(null);
    } catch (error) {
      toast.error("Donation failed");
    }
  };

  const isUpcoming = (startDate) => {
    return new Date(startDate) > new Date();
  };

  const isActive = (startDate, endDate) => {
    const now = new Date();
    return new Date(startDate) <= now && new Date(endDate) >= now;
  };

  const getStatusBadge = (startDate, endDate) => {
    if (isUpcoming(startDate)) {
      return <Badge color="blue">Upcoming</Badge>;
    } else if (isActive(startDate, endDate)) {
      return <Badge color="green">Active</Badge>;
    } else {
      return <Badge color="gray">Completed</Badge>;
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
          <h1 className="text-4xl font-bold text-white mb-2">Blood Donation Campaigns</h1>
          <p className="text-red-100">Join campaigns and make a bigger impact</p>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-white bg-opacity-95 border-red-100 hover:shadow-xl transition-shadow">
              <div className="space-y-4">
                {/* Campaign Image */}
                {campaign.image && (
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                {/* Status Badge */}
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-800">{campaign.title}</h3>
                  {getStatusBadge(campaign.startDate, campaign.endDate)}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm line-clamp-3">{campaign.description}</p>

                {/* Campaign Details */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-red-500" />
                    <span>
                      {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    <span>{campaign.location}</span>
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="mr-2 text-red-500" />
                    <span>{campaign.registeredDonors?.length || 0} registered donors</span>
                  </div>
                  {campaign.targetDonors && (
                    <div className="flex items-center">
                      <FaHeart className="mr-2 text-red-500" />
                      <span>Target: {campaign.targetDonors} donors</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  {isActive(campaign.startDate, campaign.endDate) && (
                    <>
                      <Button
                        size="sm"
                        gradientDuoTone="redToPink"
                        onClick={() => handleRegister(campaign.id)}
                        className="flex-1"
                      >
                        <FaUsers className="mr-1" />
                        Register
                      </Button>
                      <Button
                        size="sm"
                        color="gray"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowDonateModal(true);
                        }}
                      >
                        <FaCreditCard className="mr-1" />
                        Donate
                      </Button>
                    </>
                  )}
                  {isUpcoming(campaign.startDate) && (
                    <Button size="sm" color="blue" className="w-full">
                      <FaCalendarAlt className="mr-1" />
                      Coming Soon
                    </Button>
                  )}
                  {!isUpcoming(campaign.startDate) && !isActive(campaign.startDate, campaign.endDate) && (
                    <Button size="sm" color="gray" className="w-full" disabled>
                      Campaign Ended
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {campaigns.length === 0 && (
          <div className="text-center py-12">
            <FaHeart className="text-6xl text-white mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-white mb-2">No Campaigns Available</h3>
            <p className="text-red-100">Check back later for upcoming blood donation campaigns</p>
          </div>
        )}

        {/* Donation Modal */}
        <Modal show={showDonateModal} onClose={() => setShowDonateModal(false)}>
          <Modal.Header>
            Donate to {selectedCampaign?.title}
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Donation Amount (PKR)</label>
                <TextInput
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                >
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>

              {selectedCampaign && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Campaign Details</h4>
                  <p className="text-sm text-gray-600">{selectedCampaign.description}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Location: {selectedCampaign.location}
                  </p>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleDonate} gradientDuoTone="redToPink">
              Donate Now
            </Button>
            <Button color="gray" onClick={() => setShowDonateModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

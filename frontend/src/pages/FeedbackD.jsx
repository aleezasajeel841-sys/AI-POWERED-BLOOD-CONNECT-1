import React, { useState, useEffect } from "react";
import { Table, TextInput, Select, Spinner, Button, Modal, Label } from "flowbite-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useFeedback } from "../hooks/usefeedback";
import { useGenerateReport } from "../hooks/useGenerateReport";

export default function FeedbackDashboard() {
  const {
    feedbacks,
    loading,
    error,
    fetchFeedbacks,
    updateFeedbackStatus,
    deleteFeedback,
  } = useFeedback();

  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusErrors, setStatusErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const { reportUrl, generateFeedbackReport } = useGenerateReport();

  const statusOptions = ["Pending", "In Progress", "Reviewed", "Closed"];

  // Fetch feedbacks on component mount
  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Update filtered feedbacks
  useEffect(() => {
    const filtered = feedbacks.filter((feedback) => {
      const matchesSearchTerm =
        (feedback.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.comments || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType.trim() || (feedback.feedbackType || "") === filterType.trim();
      return matchesSearchTerm && matchesType;
    });
    setFilteredFeedbacks(filtered);
    // Optional: Debug log to verify filtering
    console.log("Filtered feedbacks:", filtered);
  }, [feedbacks, searchTerm, filterType]);

  // Handle search input
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Handle feedback type filter
  const handleTypeFilter = (value) => {
    setFilterType(value);
  };

  // Validate status update
  const validateStatusForm = () => {
    const errors = {};
    if (!newStatus) errors.newStatus = "Please select a status";
    else if (!statusOptions.includes(newStatus)) errors.newStatus = "Invalid status selected";
    setStatusErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open status update modal
  const handleOpenStatusModal = (feedback) => {
    setSelectedFeedback(feedback);
    setNewStatus(feedback.attentiveStatus || "Pending"); // Pre-fill with current status
    setStatusErrors({});
    setOpenStatusModal(true);
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!validateStatusForm()) return;
    if (!selectedFeedback?._id) return;

    setActionLoading(true);
    
    try {
      await updateFeedbackStatus(selectedFeedback._id, newStatus);
      setOpenStatusModal(false);
      fetchFeedbacks(); // Refresh the list
    } catch (err) {
      console.error("Error updating feedback status:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle feedback deletion
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;

    setActionLoading(true);
    try {
      await deleteFeedback(id);
      fetchFeedbacks(); // Refresh the list
    } catch (err) {
      console.error("Error deleting feedback:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    generateFeedbackReport();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Feedback Dashboard</h2>
      
        <div className="mb-2">
  <Button
    gradientDuoTone="redToPink"
    onClick={handleGenerateReport}
    disabled={loading}
    className="bg-red-500 text-white rounded-lg hover:bg-red-700 transition"
  >
    Generate Report
  </Button>

        {reportUrl && (
          <div>
            <p>Report generated successfully!</p>
            <a href={`http://localhost:3020${reportUrl}`} download
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Download Report
            </a>
          </div>
        )}   

        </div>                       

        {/* Search & Filter Controls */}
        <div className="flex gap-4 mb-4">
          <TextInput
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-1/2"
          />
          <Select
            value={filterType}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="w-1/4"
          >
            <option value="">All Types</option>
            <option value="General">General Feedbacks</option>
            <option value="Technical">Technical Feedbacks</option>
            <option value="Complaint">Complaint Feedbacks</option>
          </Select>
        </div>

        {/* Display loading, error, or feedback table */}
        {loading ? (
          <Spinner size="lg" className="mt-4" />
        ) : error ? (
          <p className="text-red-500 mt-4">{error}</p>
        ) : (
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Subject</Table.HeadCell>
              <Table.HeadCell>Comments</Table.HeadCell>
              <Table.HeadCell>Type</Table.HeadCell>
              <Table.HeadCell>Rating</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((feedback) => (
                  <Table.Row key={feedback._id} className="bg-white">
                    <Table.Cell>{feedback.subject || "N/A"}</Table.Cell>
                    <Table.Cell>{feedback.comments || "N/A"}</Table.Cell>
                    <Table.Cell>{feedback.feedbackType || "N/A"}</Table.Cell>
                    <Table.Cell>{feedback.starRating ? `${feedback.starRating} ⭐` : "N/A"}</Table.Cell>
                    <Table.Cell className="space-x-2">
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => handleDeleteFeedback(feedback._id)}
                        disabled={actionLoading}
                      >
                        Delete
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan="6" className="text-center py-4 text-gray-500">
                    No feedback found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}

        {/* Status Update Modal */}
        <Modal show={openStatusModal} onClose={() => setOpenStatusModal(false)}>
          <Modal.Header>Update Feedback Status</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <Label value={`Subject: ${selectedFeedback?.subject || "N/A"}`} />
              <div>
                <Label value="New Status" />
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                  color={statusErrors.newStatus ? "failure" : "gray"}
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
                {statusErrors.newStatus && (
                  <p className="text-red-600 text-sm mt-1">{statusErrors.newStatus}</p>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              gradientDuoTone="redToPink"
              onClick={handleUpdateStatus}
              disabled={actionLoading}
            >
              {actionLoading ? <Spinner size="sm" className="mr-2" /> : null}
              {actionLoading ? "Updating..." : "Update"}
            </Button>
            <Button
              color="gray"
              onClick={() => setOpenStatusModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
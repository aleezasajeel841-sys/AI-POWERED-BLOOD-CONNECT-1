import React, { useState, useEffect } from "react";
import { Table, TextInput, Select, Spinner, Button, Modal, Label } from "flowbite-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useInquiry } from "../hooks/useinquiry";
import { useGenerateReport } from "../hooks/useGenerateReport";

export default function InquiryDashboard() {
  const {
    inquiries,
    loading,
    error,
    fetchInquiries,
    updateInquiryStatus,
    deleteInquiry,
  } = useInquiry();

  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusErrors, setStatusErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const {reportUrl, generateInquiryReport} = useGenerateReport();

  const statusOptions = ["Pending", "In Progress", "Resolved", "Closed"];

  // Fetch inquiries on component mount
  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Update filtered inquiries
  useEffect(() => {
    const filtered = inquiries.filter((inquiry) => {
      const matchesSearchTerm =
        inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || inquiry.category === filterCategory;
      return matchesSearchTerm && matchesCategory;
    });
    setFilteredInquiries(filtered);
  }, [inquiries, searchTerm, filterCategory]);

  // Handle search input
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Handle category filter
  const handleCategoryFilter = (value) => {
    setFilterCategory(value);
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
  const handleOpenStatusModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setNewStatus(inquiry.attentiveStatus); // Pre-fill with current status
    setStatusErrors({});
    setOpenStatusModal(true);
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!validateStatusForm()) return;
    if (!selectedInquiry?._id) return;

    setActionLoading(true);
    
    try {
      await updateInquiryStatus(selectedInquiry._id, newStatus);
      setOpenStatusModal(false);
      fetchInquiries(); // Refresh the list
    } catch (err) {
      console.error("Error updating inquiry status:", err);
    } finally {
      setActionLoading(false);
    }
    console.log('selectedInquiry:', selectedInquiry);
    console.log('newStatus:', newStatus);
  };

  // Handle inquiry deletion
  const handleDeleteInquiry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;

    setActionLoading(true);
    try {
      await deleteInquiry(id);
      fetchInquiries(); // Refresh the list
    } catch (err) {
      console.error("Error deleting inquiry:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    generateInquiryReport();
};

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Inquiry Dashboard</h2>

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
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-1/2"
          />
          <Select
            value={filterCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="w-1/4"
          >
            <option value="">All Categories</option>
            <option value="General">General</option>
            <option value="Technical">Technical</option>
            <option value="Complaint">Complaint</option>
            <option value="Other">Other</option>
          </Select>
        </div>

        {/* Display loading, error, or inquiry table */}
        {loading ? (
          <Spinner size="lg" className="mt-4" />
        ) : error ? (
          <p className="text-red-500 mt-4">{error}</p>
        ) : (
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Subject</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map((inquiry) => (
                  <Table.Row key={inquiry._id} className="bg-white">
                    <Table.Cell>{inquiry.subject || "N/A"}</Table.Cell>
                    <Table.Cell>{inquiry.email || "N/A"}</Table.Cell>
                    <Table.Cell>{inquiry.category || "N/A"}</Table.Cell>
                    <Table.Cell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inquiry.attentiveStatus === "Resolved" || inquiry.attentiveStatus === "Closed"
                            ? "bg-green-100 text-green-700"
                            : inquiry.attentiveStatus === "In Progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {inquiry.attentiveStatus || "Pending"}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="space-x-2">
                      <Button
                        size="xs"
                        color="blue"
                        onClick={() => handleOpenStatusModal(inquiry)}
                        disabled={actionLoading}
                      >
                        Update Status
                      </Button>
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => handleDeleteInquiry(inquiry._id)}
                        disabled={actionLoading}
                      >
                        Delete
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan="5" className="text-center py-4 text-gray-500">
                    No inquiries found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}

        {/* Status Update Modal */}
        <Modal show={openStatusModal} onClose={() => setOpenStatusModal(false)}>
          <Modal.Header>Update Inquiry Status</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <Label value={`Subject: ${selectedInquiry?.subject || "N/A"}`} />
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
import { useEffect, useState, useMemo } from "react";
import { Table, Button, Modal, Textarea, Badge, Spinner, Label, Select } from "flowbite-react";
import { useEmergencyBR } from "../hooks/useEmergencyBR";
import { useAuthContext } from "../hooks/useAuthContext";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useGenerateReport } from "../hooks/useGenerateReport";

const EmergencyBRAdmin = () => {
  const {
    emergencyRequests,
    fetchEmergencyRequests,
    validateEmergencyRequest,
    acceptEmergencyRequest,
    declineEmergencyRequest,
    deleteEmergencyRequest,
    loading: requestsLoading,
    error,
  } = useEmergencyBR();

  const { reportUrl, loading: reportLoading, error: reportError, generateEmergencyBRReport } = useGenerateReport();
  const { user } = useAuthContext();

  const [showValidateModal, setShowValidateModal] = useState(false);
  const [validateId, setValidateId] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptId, setAcceptId] = useState(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declineId, setDeclineId] = useState(null);
  const [declineErrors, setDeclineErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState({ bloodGroup: "", criticalLevel: "", status: "" });
  const [filteredRequests, setFilteredRequests] = useState([]);

  const userId = user?.userObj?._id;
  const Donor = user?.userObj?.role === "Donor";
  const Hospital = user?.userObj?.role === "Hospital";
  const Manager = user?.userObj?.role === "Manager";

  useEffect(() => {
    fetchEmergencyRequests();
  }, [fetchEmergencyRequests]);

  // Effect to filter requests based on filter state
  useEffect(() => {
    const filtered = emergencyRequests.filter((request) => {
      const bloodGroupMatch = filter.bloodGroup
        ? request.patientBlood === filter.bloodGroup
        : true;
      const criticalLevelMatch = filter.criticalLevel
        ? request.criticalLevel === filter.criticalLevel
        : true;
      const statusMatch = filter.status
        ? request.acceptStatus === filter.status
        : true;
      return bloodGroupMatch && criticalLevelMatch && statusMatch;
    });
    setFilteredRequests(filtered);
  }, [emergencyRequests, filter]);

  // Handler for filter input changes
  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilter((prev) => ({ ...prev, [id]: value }));
  };

  // Validation function for decline reason
  const validateDeclineForm = () => {
    const errors = {};
    if (!declineReason.trim()) errors.declineReason = "Decline reason is required";
    else if (declineReason.trim().length < 10) errors.declineReason = "Reason must be at least 10 characters";
    setDeclineErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleValidate = async () => {
    setActionLoading(true);
    try {
      await validateEmergencyRequest(validateId);
      setShowValidateModal(false);
      await fetchEmergencyRequests(); // Refetch to update activeStatus
    } catch (err) {
      console.error("Error validating request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      let type = null;
      let by = null;
      if (user?.role === "Donor") {
        by = user?.userObj?._id;
        type = "Donor";
      } else if (user?.role === "Hospital") {
        by = user?.userObj?._id;
        type = "Hospital";
      }
      if (!by || !type) {
        console.error("User role not recognized for acceptance");
        return;
      }
      await acceptEmergencyRequest(acceptId, by, type);
      setShowAcceptModal(false);
      await fetchEmergencyRequests(); // Refetch to update acceptStatus
    } catch (err) {
      console.error("Error accepting request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const submitDecline = async () => {
    if (!validateDeclineForm()) return;
    setActionLoading(true);
    try {
      await declineEmergencyRequest(declineId, declineReason);
      setShowDeclineModal(false);
      setDeclineReason("");
      setDeclineErrors({});
      await fetchEmergencyRequests(); // Refetch to update acceptStatus
    } catch (err) {
      console.error("Error declining request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    setActionLoading(true);
    try {
      await deleteEmergencyRequest(deleteId);
      setShowDeleteModal(false);
      await fetchEmergencyRequests(); // Refetch to update the list
    } catch (err) {
      console.error("Error deleting request:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    try {
      // Pass filter values to generateEmergencyBRReport
      await generateEmergencyBRReport({
        bloodGroup: filter.bloodGroup,
        criticalLevel: filter.criticalLevel,
        status: filter.status
      });
    } catch (err) {
      console.error("Error generating report:", err);
    }
  };

  const criticalLevelColors = useMemo(
    () => ({
      High: "failure",
      Medium: "warning",
      Low: "success",
    }),
    []
  );

  const statusColors = useMemo(
    () => ({
      Pending: "warning",
      Accepted: "success",
      Declined: "failure",
    }),
    []
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-red-700">Emergency Blood Requests</h1>
          <Button
            gradientDuoTone="redToPink"
            onClick={handleGenerateReport}
            disabled={reportLoading || actionLoading}
            className="bg-red-500 text-white rounded-lg hover:bg-red-700 transition"
          >
            {reportLoading ? <Spinner size="sm" className="mr-2" /> : null}
            Generate Report
          </Button>
        </div>

        {reportUrl && (
          <div className="mb-4 p-4 bg-green-100 rounded-lg flex items-center justify-between">
            <p className="text-green-700 font-semibold">Report generated successfully!</p>
            <a
              href={`http://localhost:3020${reportUrl}`}
              download
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Download Report
            </a>
          </div>
        )}

        {reportError && (
          <p className="text-red-500 mb-4">{reportError}</p>
        )}

        {/* Filter UI */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Filter Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label value="Blood Group" />
              <Select
                id="bloodGroup"
                value={filter.bloodGroup}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </Select>
            </div>
            <div>
              <Label value="Critical Level" />
              <Select
                id="criticalLevel"
                value={filter.criticalLevel}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>
            </div>
            <div>
              <Label value="Status" />
              <Select
                id="status"
                value={filter.status}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
              </Select>
            </div>
          </div>
        </div>

        {requestsLoading && <Spinner className="mb-4" />}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Patient Name</Table.HeadCell>
            <Table.HeadCell>Hospital</Table.HeadCell>
            <Table.HeadCell>Blood Group</Table.HeadCell>
            <Table.HeadCell>Critical Level</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => {
                return (
                  <Table.Row key={request._id} className="bg-white">
                    <Table.Cell>{request.name || "N/A"}</Table.Cell>
                    <Table.Cell>{request.hospitalName || "N/A"}</Table.Cell>
                    <Table.Cell>{request.patientBlood || "N/A"}</Table.Cell>
                    <Table.Cell>
                      <Badge color={criticalLevelColors[request.criticalLevel] || "gray"}>
                        {request.criticalLevel || "N/A"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={statusColors[request.acceptStatus] || "gray"}>
                        {request.acceptStatus || "N/A"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className="space-x-2">
                      <div className="flex flex-wrap gap-2">
                        {/* Initial state: show Validate, View Details, Decline */}
                        {request.activeStatus !== "Active" && request.acceptStatus === "Pending" && (
                          <>
                            <Button
                              size="xs"
                              color="purple"
                              onClick={() => {
                                setValidateId(request._id);
                                setShowValidateModal(true);
                              }}
                              disabled={actionLoading}
                            >
                              Validate
                            </Button>
                            <Button
                              size="xs"
                              color="blue"
                              onClick={() => handleViewDetails(request)}
                              disabled={actionLoading}
                            >
                              Details
                            </Button>
                            <Button
                              size="xs"
                              color="failure"
                              onClick={() => {
                                setDeclineId(request._id);
                                setShowDeclineModal(true);
                              }}
                              disabled={actionLoading}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {/* After validation: show Accept, Decline, View Details */}
                        {request.activeStatus === "Active" && request.acceptStatus === "Pending" && (
                          <>
                            <Button
                              size="xs"
                              color="success"
                              onClick={() => {
                                setAcceptId(request._id);
                                setShowAcceptModal(true);
                              }}
                              disabled={actionLoading}
                            >
                              Accept
                            </Button>
                            <Button
                              size="xs"
                              color="failure"
                              onClick={() => {
                                setDeclineId(request._id);
                                setShowDeclineModal(true);
                              }}
                              disabled={actionLoading}
                            >
                              Decline
                            </Button>
                            <Button
                              size="xs"
                              color="blue"
                              onClick={() => handleViewDetails(request)}
                              disabled={actionLoading}
                            >
                              Details
                            </Button>
                          </>
                        )}
                        {/* After decline: show only Delete */}
                        {request.acceptStatus === "Declined" && (
                          <Button
                            size="xs"
                            color="gray"
                            onClick={() => confirmDelete(request._id)}
                            disabled={actionLoading}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            ) : (
              <Table.Row>
                <Table.Cell colSpan="6" className="text-center py-4 text-gray-500">
                  No emergency requests found
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>

        {/* Validate Modal */}
        <Modal show={showValidateModal} onClose={() => setShowValidateModal(false)}>
          <Modal.Header>Validate Request</Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to validate this request? This will set it to Active.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={() => setShowValidateModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              gradientDuoTone="redToPink"
              onClick={handleValidate}
              disabled={actionLoading}
            >
              {actionLoading ? <Spinner size="sm" className="mr-2" /> : null}
              {actionLoading ? "Validating..." : "Validate"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Accept Modal */}
        <Modal show={showAcceptModal} onClose={() => setShowAcceptModal(false)}>
          <Modal.Header>Accept Request</Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to accept this request?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={() => setShowAcceptModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              gradientDuoTone="redToPink"
              onClick={handleAccept}
              disabled={actionLoading}
            >
              {actionLoading ? <Spinner size="sm" className="mr-2" /> : null}
              {actionLoading ? "Accepting..." : "Accept"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Decline Modal */}
        <Modal show={showDeclineModal} onClose={() => setShowDeclineModal(false)}>
          <Modal.Header>Decline Request</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter decline reason..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                required
                color={declineErrors.declineReason ? "failure" : "gray"}
              />
              {declineErrors.declineReason && (
                <p className="text-red-600 text-sm">{declineErrors.declineReason}</p>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={() => setShowDeclineModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              gradientDuoTone="redToPink"
              onClick={submitDecline}
              disabled={actionLoading}
            >
              {actionLoading ? <Spinner size="sm" className="mr-2" /> : null}
              {actionLoading ? "Declining..." : "Decline"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <Modal.Header>Confirm Delete</Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this request? This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              gradientDuoTone="redToPink"
              onClick={executeDelete}
              disabled={actionLoading}
            >
              {actionLoading ? <Spinner size="sm" className="mr-2" /> : null}
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Details Modal */}
        <Modal show={showDetailsModal} onClose={() => setShowDetailsModal(false)} size="lg">
          <Modal.Header>Emergency Blood Request Details</Modal.Header>
          <Modal.Body>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 font-semibold">Request ID:</p>
                    <p>{selectedRequest._id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Patient Name:</p>
                    <p>{selectedRequest.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Hospital:</p>
                    <p>{selectedRequest.hospitalName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Blood Group:</p>
                    <p>{selectedRequest.patientBlood || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Critical Level:</p>
                    <Badge color={criticalLevelColors[selectedRequest.criticalLevel] || "gray"}>
                      {selectedRequest.criticalLevel || "N/A"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Status:</p>
                    <Badge color={statusColors[selectedRequest.acceptStatus] || "gray"}>
                      {selectedRequest.acceptStatus || "N/A"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-600 font-semibold">Active Status:</p>
                    <p>{selectedRequest.activeStatus || "N/A"}</p>
                  </div>
                  {selectedRequest.units && (
                    <div>
                      <p className="text-gray-600 font-semibold">Units:</p>
                      <p>{selectedRequest.units}</p>
                    </div>
                  )}
                  {selectedRequest.reason && (
                    <div>
                      <p className="text-gray-600 font-semibold">Reason:</p>
                      <p>{selectedRequest.reason}</p>
                    </div>
                  )}
                  {selectedRequest.withinDate && (
                    <div>
                      <p className="text-gray-600 font-semibold">Needed By:</p>
                      <p>
                        {new Date(selectedRequest.withinDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  {selectedRequest.proofDocument && (
                    <div className="col-span-2">
                      <p className="text-gray-600 font-semibold">Proof Document:</p>
                      <img
                        src={selectedRequest.proofDocument}
                        alt="Proof Document"
                        className="w-32 h-32 object-cover rounded-lg shadow-sm border border-gray-200 mt-2"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button color="gray" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default EmergencyBRAdmin;
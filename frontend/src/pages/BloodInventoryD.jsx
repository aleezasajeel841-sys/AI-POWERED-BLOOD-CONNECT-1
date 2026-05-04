import React, { useState, useEffect } from "react";
import { Button, Table, Modal, TextInput, Label, Select, Spinner } from "flowbite-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useBloodInventory } from "../hooks/useBloodInventory";
import { useHospital } from "../hooks/hospital";
import { useAuthContext } from "../hooks/useAuthContext";
import { useGenerateReport } from "../hooks/useGenerateReport";
import bloodIcon from '../assets/blood.png';
import { useSecondAuth } from "../hooks/useSecondAuth";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BloodInventoryD() {
  const {
    bloodInventory,
    createBloodInventory,
    updateBloodInventory,
    deleteBloodInventory,
    fetchBloodInventoryByHospital,
    fetchBloodInventory,
    toggleExpired,
  } = useBloodInventory();
  const { fetchHospitals } = useHospital();
  const { user } = useAuthContext();
  const { secondUser } = useSecondAuth();
  const { reportUrl, generateInventoryReport, generateInventoryReportByManager } = useGenerateReport();

  // User and role setup
  const userId = user?.userObj?._id;
  const Hospital = user?.role === "Hospital";
  const Manager = user?.role === "Manager";
  const HospitalAdmin = secondUser?.role === "HospitalAdmin";

  // State for add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ hospitalId: "", bloodType: "", availableStocks: "", expirationDate: "" });
  const [addErrors, setAddErrors] = useState({});

  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ hospitalId: "", bloodType: "", availableStocks: "", expirationDate: "" });
  const [editErrors, setEditErrors] = useState({});

  // State for blood type filter
  const [selectedBloodType, setSelectedBloodType] = useState("all");

  // State for missing blood types
  const [missingBloodTypes, setMissingBloodTypes] = useState([]);

  // Loading and error state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Blood Type Options
  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  // Color mapping for blood types
  const bloodTypeColors = {
    "A+": "bg-red-200 text-red-800",
    "A-": "bg-pink-200 text-pink-800",
    "B+": "bg-blue-200 text-blue-800",
    "B-": "bg-indigo-200 text-indigo-800",
    "O+": "bg-green-200 text-green-800",
    "O-": "bg-teal-200 text-teal-800",
    "AB+": "bg-purple-200 text-purple-800",
    "AB-": "bg-orange-200 text-orange-800",
  };

  // Fetch inventory based on role and check for missing blood types
  useEffect(() => {
    let isInitialFetch = true;

    const fetchInventory = async () => {
      setLoading(true);
      try {
        if (Hospital) {
          await fetchBloodInventoryByHospital(userId);
        } else if (Manager) {
          await fetchBloodInventory();
        }
      } catch (error) {
        setErrorMessage("Failed to fetch inventory. Please try again.");
        console.error("Error fetching inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();

    return () => {
      isInitialFetch = false; // Cleanup to prevent memory leaks
    };
  }, [userId, Hospital, Manager, fetchBloodInventoryByHospital, fetchBloodInventory]);

  // Check for missing blood types after inventory fetch
  useEffect(() => {
    if (!loading && bloodInventory.length > 0) {
      const presentBloodTypes = new Set(bloodInventory.map((item) => item.bloodType));
      const missingTypes = bloodTypes.filter((type) => !presentBloodTypes.has(type));
      setMissingBloodTypes(missingTypes);
    } else {
      setMissingBloodTypes([]);
    }
  }, [bloodInventory, loading]);

  // Calculate total stock levels per blood type
  const calculateTotalStocks = () => {
    const stockSummary = bloodTypes.reduce((acc, type) => {
      const total = bloodInventory
        .filter((item) => item.bloodType === type)
        .reduce((sum, item) => sum + Number(item.availableStocks), 0);
      return { ...acc, [type]: total };
    }, {});
    return stockSummary;
  };

  const stockSummary = calculateTotalStocks();

  // Validation functions
  const validateAddForm = () => {
    const errors = {};
    if (!formData.bloodType) errors.bloodType = "Blood type is required";
    else if (!bloodTypes.includes(formData.bloodType)) errors.bloodType = "Invalid blood type";
    if (!formData.availableStocks) errors.availableStocks = "Stock is required";
    else if (isNaN(formData.availableStocks) || Number(formData.availableStocks) < 0) errors.availableStocks = "Stock must be a positive number";
    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.bloodType) errors.bloodType = "Blood type is required";
    else if (!bloodTypes.includes(editFormData.bloodType)) errors.bloodType = "Invalid blood type";
    if (!editFormData.availableStocks) errors.availableStocks = "Stock is required";
    else if (isNaN(editFormData.availableStocks) || Number(editFormData.availableStocks) < 0) errors.availableStocks = "Stock must be a positive number";
    if (!editFormData.expirationDate) errors.expirationDate = "Expiration date is required";
    else if (new Date(editFormData.expirationDate) < new Date().setHours(0, 0, 0, 0)) errors.expirationDate = "Expiration date cannot be in the past";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Modal for Add
  const openAddModal = () => {
    setFormData({ hospitalId: "", bloodType: "", availableStocks: "", expirationDate: "" });
    setAddErrors({});
    setIsAddModalOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (inventory) => {
    setEditFormData({ ...inventory, expirationDate: inventory.expirationDate.split("T")[0] });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  // Close Modals
  const closeAddModal = () => setIsAddModalOpen(false);
  const closeEditModal = () => setIsEditModalOpen(false);

  // Handle Input Change for Add
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Input Change for Edit
  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Handle Create
  const handleCreate = async () => {
    if (!validateAddForm()) return;
    const newFormData = { ...formData, hospitalId: userId };
    setLoading(true);
    setErrorMessage("");
    try {
      await createBloodInventory(newFormData);
      closeAddModal();
    } catch (error) {
      setErrorMessage("Failed to add inventory. Please try again.");
      console.error("Error adding inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit
  const handleEdit = async () => {
    if (!validateEditForm()) return;
    setLoading(true);
    setErrorMessage("");
    try {
      await updateBloodInventory(editFormData._id, editFormData);
      closeEditModal();
    } catch (error) {
      setErrorMessage("Failed to update inventory. Please try again.");
      console.error("Error updating inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    setLoading(true);
    setErrorMessage("");
    try {
      await deleteBloodInventory(id);
    } catch (error) {
      setErrorMessage("Failed to delete inventory. Please try again.");
      console.error("Error deleting inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Blood Type Filter Change
  const handleBloodTypeFilterChange = (e) => {
    setSelectedBloodType(e.target.value);
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    if(Hospital) generateInventoryReport(user.userObj._id);
    else if (Manager) generateInventoryReportByManager();
  };

  // Filter blood inventory based on selected blood type
  const filteredBloodInventory = selectedBloodType === "all"
    ? bloodInventory
    : bloodInventory.filter((inventory) => inventory.bloodType === selectedBloodType);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-red-700">Blood Inventory</h1>
          <div className="flex items-center space-x-2">
            <Button gradientDuoTone="redToPink" onClick={handleGenerateReport} disabled={loading}
              className="bg-red-500 text-white rounded-lg hover:bg-red-700 transition">
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
            
          {Hospital && HospitalAdmin && (
            <div>
              <Button
                gradientDuoTone="cyanToBlue"
                onClick={openAddModal}
                className="text-white rounded-lg shadow-md hover:shadow-lg transition"
              >
                Add New Inventory
              </Button>
            </div>
          )}
        </div>

        {/* Blood Type Filter */}
        <div className="mb-4">
          <Label value="Filter by Blood Type" />
          <Select
            value={selectedBloodType}
            onChange={handleBloodTypeFilterChange}
            className="w-48"
          >
            <option value="all">All Blood Types</option>
            {bloodTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>

        {/* Blood Type Stock Summary */}
        <div className="mb-4">
          <Label value="Total Stock Levels by Blood Type" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
            {/* Chart */}
            <div className="bg-white p-4 rounded-lg shadow">
              <Bar
                data={{
                  labels: bloodTypes,
                  datasets: [
                    {
                      label: 'Stock Level',
                      data: bloodTypes.map(type => stockSummary[type] || 0),
                      backgroundColor: bloodTypes.map(type => {
                        const colors = {
                          "A+": '#EEEBDD',
                          "A-": '#810000',
                          "B+": '#630000',
                          "B-": '#1B1717',
                          "O+": '#EEEBDD',
                          "O-": '#810000',
                          "AB+": '#630000',
                          "AB-": '#1B1717',
                        };
                        return colors[type];
                      }),
                      borderColor: bloodTypes.map(type => {
                        const colors = {
                          "A+": '#EEEBDD',
                          "A-": '#810000',
                          "B+": '#630000',
                          "B-": '#1B1717',
                          "O+": '#EEEBDD',
                          "O-": '#810000',
                          "AB+": '#630000',
                          "AB-": '#1B1717',
                        };
                        return colors[type];
                      }),
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Blood Inventory Stock Levels',
                    },
                  },
                }}
              />
            </div>

            {/* Text Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {bloodTypes.map((type) => (
                <div
                  key={type}
                  className={`p-3 rounded-lg ${bloodTypeColors[type]} flex items-center justify-between`}
                >
                  <span className="font-medium">{type}</span>
                  <span className="flex items-center">
                    {stockSummary[type] || 0}
                    <img
                      src={bloodIcon}
                      alt="Blood Stock"
                      className="w-5 h-5 ml-2"
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {Hospital && HospitalAdmin && (
          <div>
            {/* Missing Blood Types Warning */}
            {missingBloodTypes.length > 0 && (
              <div className="mt-3 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                <p className="font-semibold">
                  Admin Alert: Missing Blood Types Detected!
                </p>
                <p>
                  Blood types{" "}
                  <span className="font-medium">
                    {missingBloodTypes.map((type, index) => (
                      <span
                        key={type}
                        className={`px-1 rounded ${bloodTypeColors[type] || "bg-gray-200 text-gray-800"}`}
                      >
                        {type}
                        {index < missingBloodTypes.length - 1 && ", "}
                      </span>
                    ))}
                  </span>{" "}
                  are not in the inventory. Please{" "}
                  <button
                    onClick={openAddModal}
                    className="text-red-800 underline hover:text-red-900"
                  >
                    add these blood types
                  </button>{" "}
                  immediately to ensure full inventory coverage.
                </p>
              </div>
            )}
          </div>
        )}
        <Table hoverable>
          {Hospital && HospitalAdmin && (
            <>
              <Table.Head>
                <Table.HeadCell>Blood Type</Table.HeadCell>
                <Table.HeadCell>Stock</Table.HeadCell>
                <Table.HeadCell>Expiration Date</Table.HeadCell>
                <Table.HeadCell>Expiry Status</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {filteredBloodInventory.length > 0 ? (
                  filteredBloodInventory.map((inventory) => (
                    <Table.Row key={inventory._id} className="bg-white">
                      <Table.Cell>
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${bloodTypeColors[inventory.bloodType]}`}
                        >
                          {inventory.bloodType}
                        </span>
                      </Table.Cell>
                      <Table.Cell style={{ display: 'flex', alignItems: 'center' }}>
                        {inventory.availableStocks}
                        <img
                          src={bloodIcon}
                          alt="Blood Stock"
                          style={{ width: '25px', height: '25px', marginLeft: '5px', verticalAlign: 'middle' }}
                        />
                      </Table.Cell>
                      <Table.Cell>{new Date(inventory.expirationDate).toLocaleDateString("en-GB")}</Table.Cell>
                      <Table.Cell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inventory.expiredStatus === 'Expired'
                              ? 'bg-red-100 text-red-700'
                              : inventory.expiredStatus === 'Soon'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {inventory.expiredStatus}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-2">
                          <Button
                            size="xs"
                            color="blue"
                            onClick={() => openEditModal(inventory)}
                            className="w-16"
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            color="failure"
                            onClick={() => handleDelete(inventory._id)}
                            className="w-16"
                          >
                            Delete
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan="6" className="text-center py-4 text-gray-500">
                      No blood inventory records found for the selected blood type.
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </>
          )}
          {Manager && (
            <>
              <Table.Head>
                <Table.HeadCell>Hospital Name</Table.HeadCell>
                <Table.HeadCell>Blood Type</Table.HeadCell>
                <Table.HeadCell>Stock</Table.HeadCell>
                <Table.HeadCell>Expiration Date</Table.HeadCell>
                <Table.HeadCell>Expiry Status</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {filteredBloodInventory.length > 0 ? (
                  filteredBloodInventory.map((inventory) => (
                    <Table.Row key={inventory._id} className="bg-white">
                      <Table.Cell>{inventory?.hospitalId?.name || "N/A"}</Table.Cell>
                      <Table.Cell>
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${bloodTypeColors[inventory.bloodType]}`}
                        >
                          {inventory.bloodType}
                        </span>
                      </Table.Cell>
                      <Table.Cell style={{ display: 'flex', alignItems: 'center' }}>
                        {inventory.availableStocks}
                        <img
                          src={bloodIcon}
                          alt="Blood Stock"
                          style={{ width: '25px', height: '25px', marginLeft: '5px', verticalAlign: 'middle' }}
                        />
                      </Table.Cell>
                      <Table.Cell>{new Date(inventory.expirationDate).toLocaleDateString("en-GB")}</Table.Cell>
                      <Table.Cell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inventory.expiredStatus === 'Expired'
                              ? 'bg-red-100 text-red-700'
                              : inventory.expiredStatus === 'Soon'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {inventory.expiredStatus}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan="6" className="text-center py-4 text-gray-500">
                      No blood inventory records found for the selected blood type.
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </>
          )}
        </Table>

        {/* Modal for Add */}
        <Modal show={isAddModalOpen} onClose={closeAddModal}>
          <Modal.Header>Add New Inventory</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label value="Blood Type" />
                <Select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  required
                  color={addErrors.bloodType ? "failure" : "gray"}
                >
                  <option value="" disabled>
                    Select Blood Type
                  </option>
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                {addErrors.bloodType && (
                  <p className="text-red-600 text-sm mt-1">{addErrors.bloodType}</p>
                )}
              </div>
              <div>
                <Label value="Stock" />
                <TextInput
                  type="number"
                  name="availableStocks"
                  value={formData.availableStocks}
                  onChange={handleChange}
                  required
                  color={addErrors.availableStocks ? "failure" : "gray"}
                />
                {addErrors.availableStocks && (
                  <p className="text-red-600 text-sm mt-1">{addErrors.availableStocks}</p>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              gradientDuoTone="redToPink"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              {loading ? "Adding..." : "Add"}
            </Button>
            <Button color="gray" onClick={closeAddModal} disabled={loading}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal for Edit */}
        <Modal show={isEditModalOpen} onClose={closeEditModal}>
          <Modal.Header>Edit Inventory</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label value="Stock" />
                <TextInput
                  type="number"
                  name="availableStocks"
                  value={editFormData.availableStocks}
                  onChange={handleEditChange}
                  required
                  color={editErrors.availableStocks ? "failure" : "gray"}
                />
                {editErrors.availableStocks && (
                  <p className="text-red-600 text-sm mt-1">{editErrors.availableStocks}</p>
                )}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              gradientDuoTone="redToPink"
              onClick={handleEdit}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              {loading ? "Updating..." : "Update"}
            </Button>
            <Button color="gray" onClick={closeEditModal} disabled={loading}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Error Message */}
        {errorMessage && (
          <div className="text-red-600 text-center mt-4">{errorMessage}</div>
        )}
      </div>
    </div>
  );
}
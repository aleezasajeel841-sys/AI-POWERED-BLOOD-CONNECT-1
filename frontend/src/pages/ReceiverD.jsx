import React, { useEffect, useState, useCallback } from "react";
import { Button, Table, TextInput, Label, Spinner, Select } from "flowbite-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useReceiver } from "../hooks/receiver";
import { useAuthContext } from "../hooks/useAuthContext";

export default function ReceiverDashboard() {
  const { user: receivers, loading, error, fetchReceivers, activateDeactivateReceiver } = useReceiver();
  const { user } = useAuthContext();
  const Manager = user?.role === 'Manager';
  const [filter, setFilter] = useState({
    name: "",
    bloodType: "",
    gender: "",
    city: "",
    status: ""
  });
  const [filteredReceivers, setFilteredReceivers] = useState([]);

  const loadReceivers = useCallback(() => {
    fetchReceivers();
  }, [fetchReceivers]);

  useEffect(() => {
    loadReceivers();
  }, [loadReceivers]);

  useEffect(() => {
    if (receivers && Array.isArray(receivers)) {
      const filtered = receivers.filter(receiver => {
        const fullName = `${receiver.firstName} ${receiver.lastName}`.toLowerCase();
        const nameMatch = filter.name ? fullName.includes(filter.name.toLowerCase()) : true;
        const bloodTypeMatch = filter.bloodType ? receiver.bloodType === filter.bloodType : true;
        const genderMatch = filter.gender ? receiver.gender?.toLowerCase() === filter.gender.toLowerCase() : true;
        const cityMatch = filter.city ? receiver.city?.toLowerCase().includes(filter.city.toLowerCase()) : true;
        const statusMatch = filter.status ? 
          (filter.status === "active" ? receiver.activeStatus : !receiver.activeStatus) : true;

        return nameMatch && bloodTypeMatch && genderMatch && cityMatch && statusMatch;
      });
      setFilteredReceivers(filtered);
    } else if (receivers && !Array.isArray(receivers)) {
      setFilteredReceivers([receivers]);
    } else {
      setFilteredReceivers([]);
    }
  }, [receivers, filter]);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilter(prev => ({ ...prev, [id]: value }));
  };

  const handleToggleStatus = async (receiver) => {
    if (!receiver || !receiver._id) return;
    try {
      await activateDeactivateReceiver(receiver._id);
      loadReceivers();
    } catch (err) {
      console.error("Error toggling receiver status:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {Manager ? (
        <>
          <DashboardSidebar />
          <div className="flex-1 p-6">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Receiver Dashboard</h1>

            {/* Filter Section */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Filter Receivers</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label value="Name" />
                  <TextInput
                    id="name"
                    value={filter.name}
                    onChange={handleFilterChange}
                    placeholder="Search by name"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label value="Blood Type" />
                  <Select id="bloodType" value={filter.bloodType} onChange={handleFilterChange} className="rounded-lg">
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
                  <Label value="Gender" />
                  <Select id="gender" value={filter.gender} onChange={handleFilterChange} className="rounded-lg">
                    <option value="">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
                <div>
                  <Label value="City" />
                  <TextInput
                    id="city"
                    value={filter.city}
                    onChange={handleFilterChange}
                    placeholder="Search by city"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <Label value="Status" />
                  <Select id="status" value={filter.status} onChange={handleFilterChange} className="rounded-lg">
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>
              </div>
            </div>

            {loading && <Spinner className="mb-4" />}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Table hoverable className="w-full">
                <Table.Head className="bg-red-50 text-red-800">
                  <Table.HeadCell className="px-6 py-4 font-semibold">Name</Table.HeadCell>
                  <Table.HeadCell className="px-6 py-4 font-semibold">Gender</Table.HeadCell>
                  <Table.HeadCell className="px-6 py-4 font-semibold">Email</Table.HeadCell>
                  <Table.HeadCell className="px-6 py-4 font-semibold">Phone</Table.HeadCell>
                  <Table.HeadCell className="px-6 py-4 font-semibold">Blood Type</Table.HeadCell>
                  <Table.HeadCell className="px-6 py-4 font-semibold">City</Table.HeadCell>
                  <Table.HeadCell className="px-6 py-4 font-semibold">NIC</Table.HeadCell>
                  <Table.HeadCell className="px-6 py-4 font-semibold">Status</Table.HeadCell>
                  <Table.HeadCell className="px-6 py-4 font-semibold">Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y divide-gray-200">
                  {filteredReceivers.length > 0 ? (
                    filteredReceivers.map((receiver) => (
                      <Table.Row 
                        key={receiver._id} 
                        className="bg-white hover:bg-red-50 transition-colors duration-150"
                      >
                        <Table.Cell className="px-6 py-4 text-gray-900 font-medium">
                          {`${receiver.firstName} ${receiver.lastName}`}
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4">{receiver.gender || "N/A"}</Table.Cell>
                        <Table.Cell className="px-6 py-4">{receiver.email}</Table.Cell>
                        <Table.Cell className="px-6 py-4">{receiver.phoneNumber || "N/A"}</Table.Cell>
                        <Table.Cell className="px-6 py-4 font-semibold text-red-600">
                          {receiver.bloodType || "N/A"}
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4">{receiver.city || "N/A"}</Table.Cell>
                        <Table.Cell className="px-6 py-4">{receiver.nic || "N/A"}</Table.Cell>
                        <Table.Cell 
                          className={`px-6 py-4 font-medium ${
                            receiver.activeStatus ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {receiver.activeStatus ? "Active" : "Inactive"}
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button
                              size="xs"
                              color={receiver.activeStatus ? "failure" : "success"}
                              onClick={() => handleToggleStatus(receiver)}
                              className={`rounded-lg ${receiver.activeStatus ? "bg-red-300 hover:bg-red-400" : "bg-green-600 hover:bg-green-700"}`}
                            >
                              {receiver.activeStatus ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell 
                        colSpan="9" 
                        className="text-center py-6 text-gray-500 font-medium"
                      >
                        No receivers found
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>
        </>
      ) : (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-red-600 text-lg">Access Denied: Manager role required</p>
        </div>
      )}
    </div>
  );
}

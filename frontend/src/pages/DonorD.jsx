import React, { useEffect, useState, useCallback } from "react";
import { Button, Table, TextInput, Label, Spinner, Select } from "flowbite-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useDonor } from "../hooks/donor";
import { useGenerateReport } from "../hooks/useGenerateReport";
import { useAuthContext } from "../hooks/useAuthContext";

export default function DonorDashboard() {
  const { donors, loading, error, fetchDonors, activateDeactivateDonor } = useDonor();
  const { user } = useAuthContext();
  const Manager = user?.role === 'Manager';
  const { reportUrl, generateDonorReport } = useGenerateReport();
  const [filter, setFilter] = useState({
    name: "",
    bloodType: "",
    gender: "",
    status: ""
  });
  const [filteredDonors, setFilteredDonors] = useState([]);

  const loadDonors = useCallback(() => {
    fetchDonors();
  }, [fetchDonors]);

  useEffect(() => {
    loadDonors();
  }, [loadDonors]);

  useEffect(() => {
    const filtered = donors.filter(donor => {
      const fullName = `${donor.firstName} ${donor.lastName}`.toLowerCase();
      const nameMatch = filter.name ? fullName.includes(filter.name.toLowerCase()) : true;
      const bloodTypeMatch = filter.bloodType ? donor.bloodType === filter.bloodType : true;
      const genderMatch = filter.gender ? donor.gender?.toLowerCase() === filter.gender.toLowerCase() : true;
      const statusMatch = filter.status ? 
        (filter.status === "active" ? donor.activeStatus : !donor.activeStatus) : true;

      return nameMatch && bloodTypeMatch && genderMatch && statusMatch;
    });
    setFilteredDonors(filtered);
  }, [donors, filter]);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilter(prev => ({ ...prev, [id]: value }));
  };

  const handleToggleStatus = async (donor) => {
    if (!donor || !donor._id) return;
    try {
      await activateDeactivateDonor(donor._id);
      loadDonors();
    } catch (err) {
      console.error("Error toggling donor status:", err);
    }
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    // Pass the selected bloodType to the report generation
    generateDonorReport(filter.bloodType);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {Manager ? (
        <>
          <DashboardSidebar />
          <div className="flex-1 p-6">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Donor Dashboard</h1>

            {/* Report Generation Section */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Generate Donor Report</h2>
              {reportUrl && (
                <p className="text-green-600 mt-2">Report generated successfully!</p>
              )}
              <br />
              <div className="flex items-center space-x-60">
                <Button 
                  gradientDuoTone="redToPink" 
                  onClick={handleGenerateReport} 
                  disabled={loading}
                  className="mb-0 bg-red-500 text-white rounded-lg hover:bg-red-700 transition" 
                >
                  {loading ? <Spinner size="sm" className="mr-2" /> : null}
                  {loading ? "Generating..." : "Generate Report"}
                </Button>
                
                {reportUrl && (
                  <a 
                    href={`http://localhost:3020${reportUrl}`} 
                    download
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Download Report
                  </a>
                )}
              </div>
            </div>
            
            {/* Filter Section */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">Filter Donors</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  {filteredDonors.length > 0 ? (
                    filteredDonors.map((donor) => (
                      <Table.Row 
                        key={donor._id} 
                        className="bg-white hover:bg-red-50 transition-colors duration-150"
                      >
                        <Table.Cell className="px-6 py-4 text-gray-900 font-medium">
                          {`${donor.firstName} ${donor.lastName}`}
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4">{donor.gender || "N/A"}</Table.Cell>
                        <Table.Cell className="px-6 py-4">{donor.email}</Table.Cell>
                        <Table.Cell className="px-6 py-4">{donor.phoneNumber || "N/A"}</Table.Cell>
                        <Table.Cell className="px-6 py-4 font-semibold text-red-600">
                          {donor.bloodType || "N/A"}
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4">{donor.city || "N/A"}</Table.Cell>
                        <Table.Cell className="px-6 py-4">{donor.nic || "N/A"}</Table.Cell>
                        <Table.Cell 
                          className={`px-6 py-4 font-medium ${
                            donor.activeStatus ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {donor.activeStatus ? "Active" : "Deactive"}
                        </Table.Cell>
                        <Table.Cell className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Button
                              size="xs"
                              color={donor.activeStatus ? "failure" : "success"}
                              onClick={() => handleToggleStatus(donor)}
                              className={`rounded-lg ${donor.activeStatus ? "bg-red-300 hover:bg-red-400" : "bg-green-600 hover:bg-green-700"}`}
                            >
                              {donor.activeStatus ? "Deactivate" : "Activate"}
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
                        No donors found
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
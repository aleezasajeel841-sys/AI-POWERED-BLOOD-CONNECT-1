import React, { useEffect, useState } from "react";
import { Button, Table, Modal, TextInput, Label, Spinner, FileInput, Select } from "flowbite-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useHospitalAdmin } from "../hooks/useHospitalAdmin";
import { useAuthContext } from "../hooks/useAuthContext";
import { useGenerateReport } from "../hooks/useGenerateReport";

export default function HospitalAdminsD() {
  const {
    hospitalAdmins,
    loading,
    fetchHospitalAdmins,
    createHospitalAdmin,
    updateHospitalAdmin,
    deleteHospitalAdmin,
    activateDeactivateHospitalAdmin,
    fetchHospitalAdminsByHospitalId,
  } = useHospitalAdmin();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const { user } = useAuthContext();
  const { reportUrl, generateHospitalAdminReport } = useGenerateReport();

  const [adminData, setAdminData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dob: "",
    address: "",
    nic: "",
    image: null,
    password: "",
  });

  const [filter, setFilter] = useState({
    name: "",
    email: "",
    status: "",
  });
  const [filteredAdmins, setFilteredAdmins] = useState([]);

  const hospitalId = user?.userObj?._id || "";
  const Hospital = user?.role === "Hospital";
  const Manager = user?.role === "Manager";

  useEffect(() => {
    let isMounted = true;
    if (Hospital) {
      fetchHospitalAdminsByHospitalId(hospitalId).then(() => {
        if (!isMounted) return;
      });
    } else if (Manager) {
      fetchHospitalAdmins().then(() => {
        if (!isMounted) return;
      });
    }
    return () => {
      isMounted = false;
    };
  }, [fetchHospitalAdmins, fetchHospitalAdminsByHospitalId, hospitalId, Hospital, Manager]);

  useEffect(() => {
    const filtered = hospitalAdmins.filter((admin) => {
      const nameMatch = filter.name
        ? `${admin.firstName} ${admin.lastName}`
            .toLowerCase()
            .includes(filter.name.toLowerCase())
        : true;
      const emailMatch = filter.email
        ? admin.email.toLowerCase().includes(filter.email.toLowerCase())
        : true;
      const statusMatch = filter.status
        ? filter.status === "active"
          ? admin.activeStatus
          : !admin.activeStatus
        : true;
      return nameMatch && emailMatch && statusMatch;
    });
    setFilteredAdmins(filtered);
  }, [hospitalAdmins, filter]);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilter((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = (data, isCreate = false) => {
    const errors = {};
    if (!data.email) errors.email = "Email is required";
    else if (!/^[^\s@]+@health\.gov\.lk$/.test(data.email))
      errors.email = "Email must end with @health.gov.lk";
    if (!data.firstName) errors.firstName = "First name is required";
    if (!data.lastName) errors.lastName = "Last name is required";
    if (!data.phoneNumber) errors.phoneNumber = "Phone number is required";
    else if (!/^\d{10}$/.test(data.phoneNumber))
      errors.phoneNumber = "Phone number must be exactly 10 digits";
    if (!data.dob) errors.dob = "Date of birth is required";
    else {
      const dobDate = new Date(data.dob);
      const today = new Date();
      const minAgeDate = new Date(
        today.getFullYear() - 20,
        today.getMonth(),
        today.getDate()
      );
      if (dobDate >= minAgeDate) errors.dob = "Must be at least 20 years old";
    }
    if (!data.address) errors.address = "Address is required";
    if (!data.nic) errors.nic = "NIC is required";
    else if (!/^\d{12}$/.test(data.nic))
      errors.nic = "NIC must be exactly 12 digits";
    if (isCreate && !data.password) errors.password = "Password is required";
    else if (
      data.password &&
      (data.password.length < 6 || !/[!@#$%^&*(),.?":{}|<>]/.test(data.password))
    ) {
      errors.password =
        "Password must be at least 6 characters and contain at least one special character";
    }
    if (data.image && !["image/jpeg", "image/png"].includes(data.image.type))
      errors.image = "Image must be JPG or PNG";
    return errors;
  };

  const handleToggleStatus = async (id) => {
    setToggleLoading(true);
    setApiError(null);
    try {
      await activateDeactivateHospitalAdmin(id);
    } catch (err) {
      console.error("Error toggling status:", err);
      setApiError("Failed to toggle status. Please try again.");
    } finally {
      setToggleLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    let sanitizedValue = value;
    if (id === "phoneNumber" || id === "nic") {
      sanitizedValue = value.replace(/[^0-9]/g, "");
    }
    setAdminData((prev) => ({ ...prev, [id]: sanitizedValue }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setCreateErrors((prev) => ({
          ...prev,
          image: "Image must be JPG or PNG",
        }));
      } else {
        setCreateErrors((prev) => ({ ...prev, image: null }));
        setAdminData((prev) => ({ ...prev, image: file }));
      }
    }
  };

  const handleCreate = async () => {
    const errors = validateForm(adminData, true);
    setCreateErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setCreateLoading(true);
    setApiError(null);
    try {
      const formData = new FormData();
      formData.append("hospitalId", hospitalId);
      Object.keys(adminData).forEach((key) => {
        if (adminData[key] !== null && adminData[key] !== "") {
          formData.append(key, adminData[key]);
        }
      });
      await createHospitalAdmin(formData);
      setOpenCreateModal(false);
      resetAdminData();
    } catch (err) {
      console.error("Error creating admin:", err);
      setApiError("Failed to create admin. Please try again.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setAdminData({
      email: admin.email || "",
      firstName: admin.firstName || "",
      lastName: admin.lastName || "",
      phoneNumber: admin.phoneNumber || "",
      dob: admin.dob ? admin.dob.split("T")[0] : "",
      address: admin.address || "",
      nic: admin.nic || "",
      image: null,
      password: "",
    });
    setEditErrors({});
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedAdmin) return;
    const errors = validateForm(adminData);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setUpdateLoading(true);
    setApiError(null);
    try {
      const formData = new FormData();
      Object.keys(adminData).forEach((key) => {
        if (adminData[key] !== null && adminData[key] !== "") {
          formData.append(key, adminData[key]);
        }
      });
      await updateHospitalAdmin(selectedAdmin._id, formData);
      setOpenEditModal(false);
      resetAdminData();
    } catch (err) {
      console.error("Error updating admin:", err);
      setApiError("Failed to update admin. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = (admin) => {
    setSelectedAdmin(admin);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAdmin) return;
    setDeleteLoading(true);
    setApiError(null);
    try {
      await deleteHospitalAdmin(selectedAdmin._id);
      setOpenDeleteModal(false);
    } catch (err) {
      console.error("Error deleting admin:", err);
      setApiError("Failed to delete admin. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetAdminData = () => {
    setAdminData({
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      dob: "",
      address: "",
      nic: "",
      image: null,
      password: "",
    });
    setCreateErrors({});
    setEditErrors({});
    setApiError(null);
  };

  const today = new Date();
  const maxDob = new Date(
    today.getFullYear() - 20,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

    const handleGenerateReport = (e) => {
      e.preventDefault();
      generateHospitalAdminReport(user.userObj._id);
    };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-red-700">Hospital Admins</h1>
          <div className="flex items-center space-x-4">
                      <Button gradientDuoTone="redToPink" onClick={handleGenerateReport} disabled={loading}>
                        Generate Report
                      </Button>
                      {reportUrl && (
                        <div className="flex flex-col items-center">
                          <p className="text-green-600 mb-2">Report generated!</p>
                          <a
                            href={`http://localhost:3020${reportUrl}`}
                            download
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Download
                          </a>
                        </div>
                      )}
                       <Button
            gradientDuoTone="redToPink"
            onClick={() => setOpenCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Add New Admin
          </Button>
                    </div>
         
        </div>

        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Filter Admins</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label value="Email" />
              <TextInput
                id="email"
                value={filter.email}
                onChange={handleFilterChange}
                placeholder="Search by email"
                className="rounded-lg"
              />
            </div>
            <div>
              <Label value="Status" />
              <Select
                id="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="rounded-lg"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>
        </div>

        {loading && <Spinner className="mb-4" />}

        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Phone</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredAdmins.length > 0 ? (
              filteredAdmins.map((admin) => (
                <Table.Row key={admin._id} className="bg-white">
                  <Table.Cell>{`${admin.firstName} ${admin.lastName}`}</Table.Cell>
                  <Table.Cell>{admin.email}</Table.Cell>
                  <Table.Cell>{admin.phoneNumber || "N/A"}</Table.Cell>
                  <Table.Cell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.activeStatus
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {admin.activeStatus ? "Active" : "Inactive"}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-row gap-2">
                      <Button
                        size="xs"
                        color={admin.activeStatus ? "failure" : "success"}
                        onClick={() => handleToggleStatus(admin._id)}
                        disabled={toggleLoading}
                      >
                        {admin.activeStatus ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="xs"
                        color="blue"
                        onClick={() => handleEdit(admin)}
                        disabled={updateLoading}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => handleDelete(admin)}
                        disabled={deleteLoading}
                      >
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan="5"
                  className="text-center py-4 text-gray-500"
                >
                  No hospital admins found
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>

      <Modal show={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <Modal.Header>Add New Hospital Admin</Modal.Header>
        <Modal.Body>
          {apiError && <p className="text-red-600 text-sm mb-4">{apiError}</p>}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <TextInput
                id="email"
                value={adminData.email}
                onChange={handleChange}
                required
                color={createErrors.email ? "failure" : "gray"}
                aria-describedby={
                  createErrors.email ? "email-error" : undefined
                }
              />
              {createErrors.email && (
                <p id="email-error" className="text-red-600 text-sm mt-1">
                  {createErrors.email}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <TextInput
                id="firstName"
                value={adminData.firstName}
                onChange={handleChange}
                required
                color={createErrors.firstName ? "failure" : "gray"}
                aria-describedby={
                  createErrors.firstName ? "firstName-error" : undefined
                }
              />
              {createErrors.firstName && (
                <p id="firstName-error" className="text-red-600 text-sm mt-1">
                  {createErrors.firstName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <TextInput
                id="lastName"
                value={adminData.lastName}
                onChange={handleChange}
                required
                color={createErrors.lastName ? "failure" : "gray"}
                aria-describedby={
                  createErrors.lastName ? "lastName-error" : undefined
                }
              />
              {createErrors.lastName && (
                <p id="lastName-error" className="text-red-600 text-sm mt-1">
                  {createErrors.lastName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <TextInput
                id="phoneNumber"
                value={adminData.phoneNumber}
                onChange={handleChange}
                required
                color={createErrors.phoneNumber ? "failure" : "gray"}
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                aria-describedby={
                  createErrors.phoneNumber ? "phoneNumber-error" : undefined
                }
              />
              {createErrors.phoneNumber && (
                <p id="phoneNumber-error" className="text-red-600 text-sm mt-1">
                  {createErrors.phoneNumber}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <TextInput
                id="dob"
                type="date"
                value={adminData.dob}
                onChange={handleChange}
                required
                color={createErrors.dob ? "failure" : "gray"}
                max={maxDob}
                aria-describedby={createErrors.dob ? "dob-error" : undefined}
              />
              {createErrors.dob && (
                <p id="dob-error" className="text-red-600 text-sm mt-1">
                  {createErrors.dob}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <TextInput
                id="address"
                value={adminData.address}
                onChange={handleChange}
                required
                color={createErrors.address ? "failure" : "gray"}
                aria-describedby={
                  createErrors.address ? "address-error" : undefined
                }
              />
              {createErrors.address && (
                <p id="address-error" className="text-red-600 text-sm mt-1">
                  {createErrors.address}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="nic">NIC</Label>
              <TextInput
                id="nic"
                value={adminData.nic}
                onChange={handleChange}
                required
                color={createErrors.nic ? "failure" : "gray"}
                pattern="[0-9]{12}"
                maxLength={12}
                aria-describedby={createErrors.nic ? "nic-error" : undefined}
              />
              {createErrors.nic && (
                <p id="nic-error" className="text-red-600 text-sm mt-1">
                  {createErrors.nic}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <TextInput
                id="password"
                type="password"
                value={adminData.password}
                onChange={handleChange}
                required
                color={createErrors.password ? "failure" : "gray"}
                aria-describedby={
                  createErrors.password ? "password-error" : undefined
                }
              />
              {createErrors.password && (
                <p id="password-error" className="text-red-600 text-sm mt-1">
                  {createErrors.password}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="image">Profile Image (Optional)</Label>
              <FileInput
                id="image"
                accept="image/jpeg,image/png"
                onChange={handleImageUpload}
                color={createErrors.image ? "failure" : "gray"}
                aria-describedby={
                  createErrors.image ? "image-error" : undefined
                }
              />
              {createErrors.image && (
                <p id="image-error" className="text-red-600 text-sm mt-1">
                  {createErrors.image}
                </p>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            gradientDuoTone="redToPink"
            onClick={handleCreate}
            disabled={createLoading}
          >
            {createLoading ? <Spinner size="sm" className="mr-2" /> : null}
            {createLoading ? "Creating..." : "Create"}
          </Button>
          <Button
            color="gray"
            onClick={() => setOpenCreateModal(false)}
            disabled={createLoading}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Modal.Header>Edit Hospital Admin</Modal.Header>
        <Modal.Body>
          {apiError && <p className="text-red-600 text-sm mb-4">{apiError}</p>}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <TextInput
                id="email"
                value={adminData.email}
                onChange={handleChange}
                required
                color={editErrors.email ? "failure" : "gray"}
                aria-describedby={editErrors.email ? "email-error" : undefined}
              />
              {editErrors.email && (
                <p id="email-error" className="text-red-600 text-sm mt-1">
                  {editErrors.email}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <TextInput
                id="firstName"
                value={adminData.firstName}
                onChange={handleChange}
                required
                color={editErrors.firstName ? "failure" : "gray"}
                aria-describedby={
                  editErrors.firstName ? "firstName-error" : undefined
                }
              />
              {editErrors.firstName && (
                <p id="firstName-error" className="text-red-600 text-sm mt-1">
                  {editErrors.firstName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <TextInput
                id="lastName"
                value={adminData.lastName}
                onChange={handleChange}
                required
                color={editErrors.lastName ? "failure" : "gray"}
                aria-describedby={
                  editErrors.lastName ? "lastName-error" : undefined
                }
              />
              {editErrors.lastName && (
                <p id="lastName-error" className="text-red-600 text-sm mt-1">
                  {editErrors.lastName}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <TextInput
                id="phoneNumber"
                value={adminData.phoneNumber}
                onChange={handleChange}
                required
                color={editErrors.phoneNumber ? "failure" : "gray"}
                type="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                aria-describedby={
                  editErrors.phoneNumber ? "phoneNumber-error" : undefined
                }
              />
              {editErrors.phoneNumber && (
                <p id="phoneNumber-error" className="text-red-600 text-sm mt-1">
                  {editErrors.phoneNumber}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <TextInput
                id="dob"
                type="date"
                value={adminData.dob}
                onChange={handleChange}
                required
                color={editErrors.dob ? "failure" : "gray"}
                max={maxDob}
                aria-describedby={editErrors.dob ? "dob-error" : undefined}
              />
              {editErrors.dob && (
                <p id="dob-error" className="text-red-600 text-sm mt-1">
                  {editErrors.dob}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <TextInput
                id="address"
                value={adminData.address}
                onChange={handleChange}
                required
                color={editErrors.address ? "failure" : "gray"}
                aria-describedby={
                  editErrors.address ? "address-error" : undefined
                }
              />
              {editErrors.address && (
                <p id="address-error" className="text-red-600 text-sm mt-1">
                  {editErrors.address}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="nic">NIC</Label>
              <TextInput
                id="nic"
                value={adminData.nic}
                onChange={handleChange}
                required
                color={editErrors.nic ? "failure" : "gray"}
                pattern="[0-9]{12}"
                maxLength={12}
                aria-describedby={editErrors.nic ? "nic-error" : undefined}
              />
              {editErrors.nic && (
                <p id="nic-error" className="text-red-600 text-sm mt-1">
                  {editErrors.nic}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">
                Password (Leave blank to keep unchanged)
              </Label>
              <TextInput
                id="password"
                type="password"
                value={adminData.password}
                onChange={handleChange}
                color={editErrors.password ? "failure" : "gray"}
                aria-describedby={
                  editErrors.password ? "password-error" : undefined
                }
              />
              {editErrors.password && (
                <p id="password-error" className="text-red-600 text-sm mt-1">
                  {editErrors.password}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="image">Profile Image (Upload to update)</Label>
              <FileInput
                id="image"
                accept="image/jpeg,image/png"
                onChange={handleImageUpload}
                color={editErrors.image ? "failure" : "gray"}
                aria-describedby={editErrors.image ? "image-error" : undefined}
              />
              {editErrors.image && (
                <p id="image-error" className="text-red-600 text-sm mt-1">
                  {editErrors.image}
                </p>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            gradientDuoTone="redToPink"
            onClick={handleUpdate}
            disabled={updateLoading}
          >
            {updateLoading ? <Spinner size="sm" className="mr-2" /> : null}
            {updateLoading ? "Updating..." : "Update"}
          </Button>
          <Button
            color="gray"
            onClick={() => setOpenEditModal(false)}
            disabled={updateLoading}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <Modal.Header>Confirm Delete</Modal.Header>
        <Modal.Body>
          {apiError && <p className="text-red-600 text-sm mb-4">{apiError}</p>}
          <p>
            Are you sure you want to delete {selectedAdmin?.firstName}{" "}
            {selectedAdmin?.lastName}?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            gradientDuoTone="redToPink"
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? <Spinner size="sm" className="mr-2" /> : null}
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
          <Button
            color="gray"
            onClick={() => setOpenDeleteModal(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
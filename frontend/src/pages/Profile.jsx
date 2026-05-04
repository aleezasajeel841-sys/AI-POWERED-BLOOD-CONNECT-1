import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, TextInput, Spinner, Select } from "flowbite-react";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEnvelope,
  FaIdCard,
  FaEdit,
  FaSave,
  FaTrash,
} from "react-icons/fa";
import { useAuthContext } from "../hooks/useAuthContext";
import { useHospital } from "../hooks/hospital";
import { useDonor } from "../hooks/donor";
import { useSystemManager } from "../hooks/useSystemManager";
import { useLogout } from "../hooks/useLogout";
import { toast } from "react-toastify";
import moment from "moment";
import validator from "validator";
import axios from "axios";

export default function Profile() {
  const { user, dispatch } = useAuthContext();
  const { logout } = useLogout();
  const { hospitals = [], fetchHospitals, loading: hLoading } = useHospital();
  const { updateDonor, deleteDonor } = useDonor();
  const { updateHospital, deleteHospital } = useHospital();
  const { updateManager, deleteManager } = useSystemManager();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileData, setProfileData] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const userId = user?.userObj?._id || null;
  const userRole = user?.role || null;

  // Calculate max date for DOB based on role (18 for Donor, 20 for Hospital/Manager)
  const getMaxDob = () => {
    const today = moment();
    if (userRole === "Donor") {
      return today.subtract(18, "years").format("YYYY-MM-DD");
    }
    return today.subtract(20, "years").format("YYYY-MM-DD");
  };

  const fetchUserData = useCallback(async (id, role) => {
    try {
      setLoading(true);
      setFetchError(null);
      let endpoint;
      switch (role) {
        case "Donor":
          endpoint = `/api/donor/${id}`;
          break;
        case "Hospital":
          endpoint = `/api/hospital/${id}`;
          break;
        case "Manager":
          endpoint = `/api/manager/${id}`;
          break;
        default:
          throw new Error("Invalid role");
      }
      const response = await axios.get(endpoint);
      const data = response.data;

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response data");
      }

      let newProfileData;
      if (role === "Hospital") {
        newProfileData = {
          name: data.name || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          city: data.city || "",
          address: data.address || "",
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          systemManagerId: data.systemManagerId || "",
          identificationNumber: data.identificationNumber || "",
          activeStatus: data.activeStatus ?? true,
        };
      } else if (role === "Donor") {
        newProfileData = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          city: data.city || "",
          dob: data.dob ? moment(data.dob).format("YYYY-MM-DD") : "",
          bloodType: data.bloodType || "",
          nic: data.nic || "",
          healthStatus: data.healthStatus ?? false,
          activeStatus: data.activeStatus ?? true,
          appointmentStatus: data.appointmentStatus ?? false,
        };
      } else if (role === "Manager") {
        newProfileData = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          dob: data.dob ? moment(data.dob).format("YYYY-MM-DD") : "",
          nic: data.nic || "",
          role: data.role || "Master",
          activeStatus: data.activeStatus ?? true,
        };
      }

      setProfileData(newProfileData);
      dispatch({ type: "UPDATE_USER", payload: { ...user, userObj: data } });
      localStorage.setItem("user", JSON.stringify({ ...user, userObj: data }));
      console.log("Fetched profileData:", newProfileData);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error fetching profile data";
      setFetchError(errorMessage);
      setProfileData(null);
      toast.error(errorMessage);
      console.error("Fetch error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (userId && userRole) {
      console.log("Fetching data for user:", { userId, userRole });
      fetchUserData(userId, userRole).catch(() => {});
      if (userRole === "Hospital") {
        fetchHospitals();
      }
    }
  }, [userId, userRole, fetchHospitals, fetchUserData]);

  const validateForm = () => {
    const newErrors = {};
    if (!profileData) {
      newErrors.form = "Profile data not loaded";
      setErrors(newErrors);
      return false;
    }
    if (userRole === "Hospital") {
      if (!profileData.name) newErrors.name = "Name is required";
      if (!profileData.email) newErrors.email = "Email is required";
      else if (!validator.isEmail(profileData.email)) newErrors.email = "Invalid email format";
      if (!profileData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
      else if (!/^\d{10}$/.test(profileData.phoneNumber)) newErrors.phoneNumber = "Must be exactly 10 digits";
      if (!profileData.city) newErrors.city = "City is required";
      if (!profileData.address) newErrors.address = "Address is required";
      if (!profileData.startTime || !moment(profileData.startTime, "HH:mm", true).isValid())
        newErrors.startTime = "Valid start time (HH:mm) is required";
      if (!profileData.endTime || !moment(profileData.endTime, "HH:mm", true).isValid())
        newErrors.endTime = "Valid end time (HH:mm) is required";
      if (!profileData.identificationNumber) newErrors.identificationNumber = "Identification number is required";
      else if (!/^\d{12}$/.test(profileData.identificationNumber))
        newErrors.identificationNumber = "Must be exactly 12 digits";
    } else if (userRole === "Donor" || userRole === "Manager") {
      if (!profileData.firstName) newErrors.firstName = "First name is required";
      if (!profileData.lastName) newErrors.lastName = "Last name is required";
      if (!profileData.email) newErrors.email = "Email is required";
      else if (!validator.isEmail(profileData.email)) newErrors.email = "Invalid email format";
      if (!profileData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
      else if (!/^\d{10}$/.test(profileData.phoneNumber)) newErrors.phoneNumber = "Must be exactly 10 digits";
      if (!profileData.address && userRole === "Manager") newErrors.address = "Address is required";
      if (!profileData.city && userRole === "Donor") newErrors.city = "City is required";
      if (!profileData.dob) newErrors.dob = "Date of birth is required";
      else {
        const age = moment().diff(moment(profileData.dob), "years");
        if (userRole === "Donor" && age < 18) newErrors.dob = "Must be at least 18 years old";
        else if ((userRole === "Hospital" || userRole === "Manager") && age < 20)
          newErrors.dob = "Must be at least 20 years old";
      }
      if (!profileData.nic) newErrors.nic = "NIC is required";
      else if (!/^\d{12}$/.test(profileData.nic)) newErrors.nic = "Must be exactly 12 digits";
      if (userRole === "Donor" && !profileData.bloodType) newErrors.bloodType = "Blood type is required";
      if (userRole === "Manager" && !profileData.role) newErrors.role = "Role is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Restrict phoneNumber and nic/identificationNumber to digits only
    if (name === "phoneNumber" || name === "nic" || name === "identificationNumber") {
      if (/^\d*$/.test(value)) {
        setProfileData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSave = async () => {
    if (!profileData || !validateForm()) {
      console.log("Validation failed:", errors);
      return;
    }
    setLoading(true);
    try {
      let updatedData;
      console.log("Saving profileData:", profileData);
      if (userRole === "Hospital") {
        updatedData = await updateHospital(userId, profileData);
        console.log("updateHospital response:", updatedData);
      } else if (userRole === "Donor") {
        updatedData = await updateDonor(userId, profileData);
        console.log("updateDonor response:", updatedData);
      } else if (userRole === "Manager") {
        updatedData = await updateManager(userId, profileData);
        console.log("updateManager response:", updatedData);
      }

      const newProfileData =
        userRole === "Hospital"
          ? {
              name: updatedData?.name || profileData.name || "",
              email: updatedData?.email || profileData.email || "",
              phoneNumber: updatedData?.phoneNumber || profileData.phoneNumber || "",
              city: updatedData?.city || profileData.city || "",
              address: updatedData?.address || profileData.address || "",
              startTime: updatedData?.startTime || profileData.startTime || "",
              endTime: updatedData?.endTime || profileData.endTime || "",
              systemManagerId: updatedData?.systemManagerId || profileData.systemManagerId || "",
              identificationNumber: updatedData?.identificationNumber || profileData.identificationNumber || "",
              activeStatus: updatedData?.activeStatus ?? profileData.activeStatus,
            }
          : userRole === "Donor"
          ? {
              firstName: updatedData?.firstName || profileData.firstName || "",
              lastName: updatedData?.lastName || profileData.lastName || "",
              email: updatedData?.email || profileData.email || "",
              phoneNumber: updatedData?.phoneNumber || profileData.phoneNumber || "",
              city: updatedData?.city || profileData.city || "",
              dob: updatedData?.dob ? moment(updatedData.dob).format("YYYY-MM-DD") : profileData.dob || "",
              bloodType: updatedData?.bloodType || profileData.bloodType || "",
              nic: updatedData?.nic || profileData.nic || "",
              healthStatus: updatedData?.healthStatus ?? profileData.healthStatus,
              activeStatus: updatedData?.activeStatus ?? profileData.activeStatus,
              appointmentStatus: updatedData?.appointmentStatus ?? profileData.appointmentStatus,
            }
          : {
              firstName: updatedData?.firstName || profileData.firstName || "",
              lastName: updatedData?.lastName || profileData.lastName || "",
              email: updatedData?.email || profileData.email || "",
              phoneNumber: updatedData?.phoneNumber || profileData.phoneNumber || "",
              address: updatedData?.address || profileData.address || "",
              dob: updatedData?.dob ? moment(updatedData.dob).format("YYYY-MM-DD") : profileData.dob || "",
              nic: updatedData?.nic || profileData.nic || "",
              role: updatedData?.role || profileData.role || "Master",
              activeStatus: updatedData?.activeStatus ?? profileData.activeStatus,
            };

      setProfileData(newProfileData);
      console.log("Updated profileData:", newProfileData);
      dispatch({ type: "UPDATE_USER", payload: { ...user, userObj: updatedData || profileData } });
      localStorage.setItem("user", JSON.stringify({ ...user, userObj: updatedData || profileData }));
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error updating profile";
      console.error("Update error:", err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? You will be logged out.")) {
      return;
    }
    setLoading(true);
    try {
      if (userRole === "Hospital") {
        await deleteHospital(userId);
      } else if (userRole === "Donor") {
        await deleteDonor(userId);
      } else if (userRole === "Manager") {
        await deleteManager(userId);
      }
      logout();
      toast.success("Account deleted successfully");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error deleting account";
      toast.error(errorMessage);
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderProfileContent = () => {
    if (!profileData || !userRole) {
      return <div className="text-center text-red-700">Profile data not loaded</div>;
    }

    switch (userRole.toLowerCase()) {
      case "donor":
        return (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-5xl font-bold text-red-700 drop-shadow-md">My Donor Profile</h2>
              <div className="flex gap-4">
                <Button
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  gradientDuoTone="redToPink"
                  size="lg"
                  className="flex items-center"
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" className="mr-2" /> : isEditing ? <FaSave className="mr-2" /> : <FaEdit className="mr-2" />}
                  {loading ? "Saving..." : isEditing ? "Save" : "Edit Profile"}
                </Button>
                <Button
                  onClick={handleDeactivate}
                  color="failure"
                  size="lg"
                  className="flex items-center"
                  disabled={loading}
                >
                  <FaTrash className="mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
              <div className="flex flex-col items-center space-y-6">
                <FaUser className="text-8xl text-red-700" />
                {isEditing ? (
                  <>
                    <TextInput
                      name="firstName"
                      value={profileData.firstName || ""}
                      onChange={handleChange}
                      className="text-center w-full"
                      required
                      color={errors.firstName ? "failure" : "gray"}
                      aria-label="First name"
                      disabled={loading || !isEditing}
                    />
                    {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
                    <TextInput
                      name="lastName"
                      value={profileData.lastName || ""}
                      onChange={handleChange}
                      className="text-center w-full"
                      required
                      color={errors.lastName ? "failure" : "gray"}
                      aria-label="Last name"
                      disabled={loading || !isEditing}
                    />
                    {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
                  </>
                ) : (
                  <h3 className="text-3xl font-semibold">
                    {profileData.firstName && profileData.lastName
                      ? `${profileData.firstName} ${profileData.lastName}`
                      : "Unknown Name"}
                  </h3>
                )}
              </div>
              <div className="space-y-6 text-lg">
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="email"
                        value={profileData.email || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.email ? "failure" : "gray"}
                        aria-label="Email"
                        disabled={loading || !isEditing}
                      />
                      {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                    </>
                  ) : (
                    <span>{profileData.email || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="phoneNumber"
                        value={profileData.phoneNumber || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.phoneNumber ? "failure" : "gray"}
                        aria-label="Phone number"
                        disabled={loading || !isEditing}
                        maxLength={10}
                        type="text"
                        pattern="\d*"
                      />
                      {errors.phoneNumber && <p className="text-red-600 text-sm">{errors.phoneNumber}</p>}
                    </>
                  ) : (
                    <span>{profileData.phoneNumber || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="city"
                        value={profileData.city || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.city ? "failure" : "gray"}
                        aria-label="City"
                        disabled={loading || !isEditing}
                      />
                      {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
                    </>
                  ) : (
                    <span>{profileData.city || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="dob"
                        type="date"
                        value={profileData.dob || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.dob ? "failure" : "gray"}
                        aria-label="Date of birth"
                        disabled={loading || !isEditing}
                        max={getMaxDob()}
                      />
                      {errors.dob && <p className="text-red-600 text-sm">{errors.dob}</p>}
                    </>
                  ) : (
                    <span>{profileData.dob ? moment(profileData.dob).format("MMMM D, YYYY") : "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaIdCard className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="nic"
                        value={profileData.nic || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.nic ? "failure" : "gray"}
                        aria-label="NIC"
                        disabled={loading || !isEditing}
                        maxLength={12}
                        type="text"
                        pattern="\d*"
                      />
                      {errors.nic && <p className="text-red-600 text-sm">{errors.nic}</p>}
                    </>
                  ) : (
                    <span>{profileData.nic || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <Select
                        name="bloodType"
                        value={profileData.bloodType || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.bloodType ? "failure" : "gray"}
                        aria-label="Blood type"
                        disabled={loading || !isEditing}
                      >
                        <option value="" disabled>
                          Select blood type
                        </option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </Select>
                      {errors.bloodType && <p className="text-red-600 text-sm">{errors.bloodType}</p>}
                    </>
                  ) : (
                    <span>Blood Type: {profileData.bloodType || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span>Health Status: {profileData.healthStatus ? "Healthy" : "Not Healthy"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Appointment Status: {profileData.appointmentStatus ? "Scheduled" : "Not Scheduled"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Active Status: {profileData.activeStatus ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
          </>
        );

      case "hospital":
        return (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-5xl font-bold text-red-700 drop-shadow-md">Hospital Profile</h2>
              <div className="flex gap-4">
                <Button
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  gradientDuoTone="redToPink"
                  size="lg"
                  className="flex items-center"
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" className="mr-2" /> : isEditing ? <FaSave className="mr-2" /> : <FaEdit className="mr-2" />}
                  {loading ? "Saving..." : isEditing ? "Save" : "Edit Profile"}
                </Button>
                <Button
                  onClick={handleDeactivate}
                  color="failure"
                  size="lg"
                  className="flex items-center"
                  disabled={loading}
                >
                  <FaTrash className="mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
              <div className="flex flex-col items-center space-y-6">
                <FaUser className="text-8xl text-red-700" />
                {isEditing ? (
                  <>
                    <TextInput
                      name="name"
                      value={profileData.name || ""}
                      onChange={handleChange}
                      className="text-center w-full"
                      required
                      color={errors.name ? "failure" : "gray"}
                      aria-label="Hospital name"
                      disabled={loading || !isEditing}
                    />
                    {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                  </>
                ) : (
                  <h3 className="text-3xl font-semibold">{profileData.name || "Unknown Hospital"}</h3>
                )}
              </div>
              <div className="space-y-6 text-lg">
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="email"
                        value={profileData.email || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.email ? "failure" : "gray"}
                        aria-label="Email"
                        disabled={loading || !isEditing}
                      />
                      {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                    </>
                  ) : (
                    <span>{profileData.email || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="phoneNumber"
                        value={profileData.phoneNumber || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.phoneNumber ? "failure" : "gray"}
                        aria-label="Phone number"
                        disabled={loading || !isEditing}
                        maxLength={10}
                        type="text"
                        pattern="\d*"
                      />
                      {errors.phoneNumber && <p className="text-red-600 text-sm">{errors.phoneNumber}</p>}
                    </>
                  ) : (
                    <span>{profileData.phoneNumber || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="city"
                        value={profileData.city || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.city ? "failure" : "gray"}
                        aria-label="City"
                        disabled={loading || !isEditing}
                      />
                      {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
                    </>
                  ) : (
                    <span>{profileData.city || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="address"
                        value={profileData.address || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.address ? "failure" : "gray"}
                        aria-label="Address"
                        disabled={loading || !isEditing}
                      />
                      {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
                    </>
                  ) : (
                    <span>{profileData.address || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="startTime"
                        value={profileData.startTime || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.startTime ? "failure" : "gray"}
                        aria-label="Start time"
                        disabled={loading || !isEditing}
                      />
                      {errors.startTime && <p className="text-red-600 text-sm">{errors.startTime}</p>}
                    </>
                  ) : (
                    <span>Start Time: {profileData.startTime || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="endTime"
                        value={profileData.endTime || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.endTime ? "failure" : "gray"}
                        aria-label="End time"
                        disabled={loading || !isEditing}
                      />
                      {errors.endTime && <p className="text-red-600 text-sm">{errors.endTime}</p>}
                    </>
                  ) : (
                    <span>End Time: {profileData.endTime || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaIdCard className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="identificationNumber"
                        value={profileData.identificationNumber || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.identificationNumber ? "failure" : "gray"}
                        aria-label="Identification Number"
                        disabled={loading || !isEditing}
                        maxLength={12}
                        type="text"
                        pattern="\d*"
                      />
                      {errors.identificationNumber && <p className="text-red-600 text-sm">{errors.identificationNumber}</p>}
                    </>
                  ) : (
                    <span>{profileData.identificationNumber || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span>System Manager ID: {profileData.systemManagerId || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Active Status: {profileData.activeStatus ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
          </>
        );

      case "manager":
        return (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-5xl font-bold text-red-700 drop-shadow-md">System Manager Profile</h2>
              <div className="flex gap-4">
                <Button
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  gradientDuoTone="redToPink"
                  size="lg"
                  className="flex items-center"
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" className="mr-2" /> : isEditing ? <FaSave className="mr-2" /> : <FaEdit className="mr-2" />}
                  {loading ? "Saving..." : isEditing ? "Save" : "Edit Profile"}
                </Button>
                <Button
                  onClick={handleDeactivate}
                  color="failure"
                  size="lg"
                  className="flex items-center"
                  disabled={loading}
                >
                  <FaTrash className="mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700">
              <div className="flex flex-col items-center space-y-6">
                <FaUser className="text-8xl text-red-700" />
                {isEditing ? (
                  <>
                    <TextInput
                      name="firstName"
                      value={profileData.firstName || ""}
                      onChange={handleChange}
                      className="text-center w-full"
                      required
                      color={errors.firstName ? "failure" : "gray"}
                      aria-label="First name"
                      disabled={loading || !isEditing}
                    />
                    {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
                    <TextInput
                      name="lastName"
                      value={profileData.lastName || ""}
                      onChange={handleChange}
                      className="text-center w-full"
                      required
                      color={errors.lastName ? "failure" : "gray"}
                      aria-label="Last name"
                      disabled={loading || !isEditing}
                    />
                    {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
                  </>
                ) : (
                  <h3 className="text-3xl font-semibold">
                    {profileData.firstName && profileData.lastName
                      ? `${profileData.firstName} ${profileData.lastName}`
                      : "Unknown Name"}
                  </h3>
                )}
              </div>
              <div className="space-y-6 text-lg">
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="email"
                        value={profileData.email || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.email ? "failure" : "gray"}
                        aria-label="Email"
                        disabled={loading || !isEditing}
                      />
                      {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                    </>
                  ) : (
                    <span>{profileData.email || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="phoneNumber"
                        value={profileData.phoneNumber || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.phoneNumber ? "failure" : "gray"}
                        aria-label="Phone number"
                        disabled={loading || !isEditing}
                        maxLength={10}
                        type="text"
                        pattern="\d*"
                      />
                      {errors.phoneNumber && <p className="text-red-600 text-sm">{errors.phoneNumber}</p>}
                    </>
                  ) : (
                    <span>{profileData.phoneNumber || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="address"
                        value={profileData.address || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.address ? "failure" : "gray"}
                        aria-label="Address"
                        disabled={loading || !isEditing}
                      />
                      {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
                    </>
                  ) : (
                    <span>{profileData.address || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="dob"
                        type="date"
                        value={profileData.dob || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.dob ? "failure" : "gray"}
                        aria-label="Date of birth"
                        disabled={loading || !isEditing}
                        max={getMaxDob()}
                      />
                      {errors.dob && <p className="text-red-600 text-sm">{errors.dob}</p>}
                    </>
                  ) : (
                    <span>{profileData.dob ? moment(profileData.dob).format("MMMM D, YYYY") : "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <FaIdCard className="text-red-700" />
                  {isEditing ? (
                    <>
                      <TextInput
                        name="nic"
                        value={profileData.nic || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.nic ? "failure" : "gray"}
                        aria-label="NIC"
                        disabled={loading || !isEditing}
                        maxLength={12}
                        type="text"
                        pattern="\d*"
                      />
                      {errors.nic && <p className="text-red-600 text-sm">{errors.nic}</p>}
                    </>
                  ) : (
                    <span>{profileData.nic || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <Select
                        name="role"
                        value={profileData.role || ""}
                        onChange={handleChange}
                        className="w-full"
                        required
                        color={errors.role ? "failure" : "gray"}
                        aria-label="Role"
                        disabled={loading || !isEditing}
                      >
                        <option value="Master">Master</option>
                        <option value="Junior">Junior</option>
                      </Select>
                      {errors.role && <p className="text-red-600 text-sm">{errors.role}</p>}
                    </>
                  ) : (
                    <span>Role: {profileData.role || "N/A"}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span>Active Status: {profileData.activeStatus ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return <div className="text-center text-red-700">Unauthorized Role</div>;
    }
  };

  if (fetchError) {
    return (
      <div className="text-center text-red-700">
        <p>{fetchError}</p>
        <Button onClick={() => fetchUserData(userId, userRole)} color="gray" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (loading || hLoading || !profileData || !userRole) {
    return (
      <div className="text-center">
        <Spinner size="lg" />
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-red-400 to-red-600 p-6">
      <Card className="w-full max-w-4xl p-10 shadow-2xl rounded-3xl bg-white bg-opacity-95 border border-red-100">
        {renderProfileContent()}
      </Card>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, TextInput, Spinner } from "flowbite-react";
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
import { useHospital } from "../hooks/hospital";
import { useHospitalAdmin } from "../hooks/useHospitalAdmin";
import { useLogout } from "../hooks/useLogout";
import { toast } from "react-toastify";
import moment from "moment";
import validator from "validator";
import axios from "axios";
import { useSecondAuth } from "../hooks/useSecondAuth";

export default function HospitalAdminProfile({ onDataFetched }) {
  const { secondUser, dispatch } = useSecondAuth();
  const { logout } = useLogout();
  const { hospitals = [], fetchHospitals, loading: hLoading } = useHospital();
  const { updateHospitalAdmin, deleteHospitalAdmin } = useHospitalAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileData, setProfileData] = useState(null); // Initialize as null for better checking
  const [fetchError, setFetchError] = useState(null); // Track fetch errors

  const userId = secondUser?.userObj?._id || null;
  const userRole = secondUser?.role || null;

  // Fetch HospitalAdmin data from backend
  const fetchUserData = useCallback(async (id) => {
    try {
      setLoading(true);
      setFetchError(null);
      const endpoint = `/api/healthAd/${id}`;
      const response = await axios.get(endpoint);
      const data = response.data;

      // Format data for profile
      const formattedData = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        address: data.address || "",
        dob: data.dob ? moment(data.dob).format("YYYY-MM-DD") : "",
        nic: data.nic || "",
        hospitalId: data.hospitalId || "",
        activeStatus: data.activeStatus ?? true,
      };

      setProfileData(formattedData);

      // Update localStorage and auth context
      dispatch({ type: "UPDATE_USER", payload: { ...secondUser, userObj: data } });
      localStorage.setItem("secondUser", JSON.stringify({ ...secondUser, userObj: data }));

      // Call onDataFetched callback if provided
      if (onDataFetched) {
        onDataFetched(data);
      }

      return data; // Return the fetched data
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error fetching profile data";
      setFetchError(errorMessage);
      toast.error(errorMessage);
      console.error("Fetch error:", err); // Log for debugging
      throw err; // Throw error for external handling
    } finally {
      setLoading(false);
    }
  }, [secondUser, dispatch, onDataFetched]);

  useEffect(() => {
    if (userId && userRole === "HospitalAdmin") {
      fetchUserData(userId)
        .catch(() => {
          // Error already handled in fetchUserData
        });
      fetchHospitals();
    }
  }, [userId, userRole, fetchHospitals, fetchUserData]);

  const validateForm = () => {
    const newErrors = {};
    if (!profileData?.firstName) newErrors.firstName = "First name is required";
    if (!profileData?.lastName) newErrors.lastName = "Last name is required";
    if (!profileData?.email) newErrors.email = "Email is required";
    else if (!validator.isEmail(profileData.email)) newErrors.email = "Invalid email format";
    if (!profileData?.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    else if (!/^\d{10}$/.test(profileData.phoneNumber)) newErrors.phoneNumber = "Must be a 10-digit number";
    if (!profileData?.address) newErrors.address = "Address is required";
    if (!profileData?.dob) newErrors.dob = "Date of birth is required";
    else if (moment().diff(moment(profileData.dob), "years") < 18) newErrors.dob = "Must be at least 18 years old";
    if (!profileData?.nic) newErrors.nic = "NIC is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = async () => {
    if (!profileData || !validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    setLoading(true);
    try {
      const updatedData = await updateHospitalAdmin(userId, profileData);
      // Use safe access and fallbacks for updatedData
      const newProfileData = {
        firstName: updatedData?.firstName || profileData.firstName || "",
        lastName: updatedData?.lastName || profileData.lastName || "",
        email: updatedData?.email || profileData.email || "",
        phoneNumber: updatedData?.phoneNumber || profileData.phoneNumber || "",
        address: updatedData?.address || profileData.address || "",
        dob: updatedData?.dob ? moment(updatedData.dob).format("YYYY-MM-DD") : profileData.dob || "",
        nic: updatedData?.nic || profileData.nic || "",
        hospitalId: updatedData?.hospitalId || profileData.hospitalId || "",
        activeStatus: updatedData?.activeStatus ?? profileData.activeStatus ?? true,
      };
      setProfileData(newProfileData);
      // Update localStorage and auth context
      dispatch({ type: "UPDATE_USER", payload: { ...secondUser, userObj: updatedData } });
      localStorage.setItem("secondUser", JSON.stringify({ ...secondUser, userObj: updatedData }));
      setIsEditing(false);
      toast.success("Profile updated successfully");

      // Call onDataFetched with updated data if provided
      if (onDataFetched) {
        onDataFetched(updatedData);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error updating profile";
      toast.error(errorMessage);
      console.error("Update error:", err); // Log for debugging
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
      await deleteHospitalAdmin(userId);
      logout();
      toast.success("Account deleted successfully");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error deleting account";
      toast.error(errorMessage);
      console.error("Delete error:", err); // Log for debugging
    } finally {
      setLoading(false);
    }
  };

  if (userRole !== "HospitalAdmin") {
    return <div className="text-center text-red-700">Unauthorized Role</div>;
  }

  if (fetchError) {
    return (
      <div className="text-center text-red-700">
        <p>{fetchError}</p>
        <Button onClick={() => fetchUserData(userId)} color="gray" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (loading || hLoading || !profileData) {
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-5xl font-bold text-red-700 drop-shadow-md">Hospital Admin Profile</h2>
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
                  disabled={loading}
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
                  disabled={loading}
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
              <span>
                Hospital: {hospitals?.find((h) => h._id === profileData.hospitalId)?.name || "Unknown Hospital"}
              </span>
            </div>
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                  {errors.nic && <p className="text-red-600 text-sm">{errors.nic}</p>}
                </>
              ) : (
                <span>{profileData.nic || "N/A"}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span>Active Status: {profileData.activeStatus ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
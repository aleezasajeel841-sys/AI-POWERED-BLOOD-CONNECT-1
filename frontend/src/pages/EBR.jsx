import React, { useState } from "react";
import { Button, Card, Label, TextInput, Select, Datepicker, Spinner } from "flowbite-react";
import { useEmergencyBR } from "../hooks/useEmergencyBR";
import { toast } from 'react-toastify';
import background from '../assets/bg1.jpg';

export default function EmergencyBloodRequest() {
  const { createEmergencyRequest, loading } = useEmergencyBR();

  const [formData, setFormData] = useState({
    name: '',
    proofOfIdentificationNumber: '',
    hospitalName: '',
    address: '',
    phoneNumber: '',
    patientBlood: '',
    units: '',
    criticalLevel: 'Medium',
    withinDate: null,
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const criticalLevels = ['Low', 'Medium', 'High'];
  const today = new Date();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.proofOfIdentificationNumber) newErrors.proofOfIdentificationNumber = 'ID number is required';
    else if (!/^\d+$/.test(formData.proofOfIdentificationNumber)) newErrors.proofOfIdentificationNumber = 'ID must be numeric';
    if (!formData.hospitalName) newErrors.hospitalName = 'Hospital name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
    if (!formData.patientBlood) newErrors.patientBlood = 'Blood type is required';
    else if (!bloodTypes.includes(formData.patientBlood)) newErrors.patientBlood = 'Invalid blood type';
    if (!formData.units) newErrors.units = 'Units are required';
    else if (isNaN(formData.units) || formData.units <= 0) newErrors.units = 'Must be a positive number';
    if (!formData.criticalLevel || !criticalLevels.includes(formData.criticalLevel)) newErrors.criticalLevel = 'Invalid critical level';
    if (!formData.withinDate) newErrors.withinDate = 'Needed by date is required';
    else if (new Date(formData.withinDate) < today) newErrors.withinDate = 'Date must be today or in the future';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setImagePreview(null);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'phoneNumber' && value && !/^\d*$/.test(value)) return; // Only allow digits
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, withinDate: date }));
    setErrors((prev) => ({ ...prev, withinDate: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const requestData = { ...formData };
    try {
      await createEmergencyRequest(requestData, file);
      toast.success('Emergency blood request submitted successfully!');
      setFormData({
        name: '',
        proofOfIdentificationNumber: '',
        hospitalName: '',
        address: '',
        phoneNumber: '',
        patientBlood: '',
        units: '',
        criticalLevel: 'Medium',
        withinDate: null,
      });
      setImagePreview(null);
      setFile(null);
      document.querySelector("#image").value = "";
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error submitting request');
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6 bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Card className="w-full max-w-6xl p-8 shadow-2xl rounded-2xl bg-white bg-opacity-95 backdrop-blur-lg">
        <h2 className="text-4xl font-extrabold text-center text-red-700 mb-8">
          Emergency Blood Request
        </h2>

        {loading && (
          <div className="flex justify-center mb-4">
            <Spinner size="md" color="red" />
            <span className="ml-2 text-gray-600">Submitting...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Info Section */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-red-600 mb-6">Information</h3>
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-xl font-semibold text-red-600">Stock Availability</h4>
                <p className="text-gray-700 mt-2">Current available blood units will be displayed here.</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-xl font-semibold text-red-600">Donor Information</h4>
                <p className="text-gray-700 mt-2">Details about our registered donors.</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-xl font-semibold text-red-600">Why Donate?</h4>
                <p className="text-gray-700 mt-2">
                  Blood donation saves lives. If you require emergency blood, please complete the request form.
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-red-600 mb-6">Request Form</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" value="Full Name" className="text-gray-700" />
                  <TextInput
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                    color={errors.name ? 'failure' : 'gray'}
                    className="mt-1"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="proofOfIdentificationNumber" value="ID Number" className="text-gray-700" />
                  <TextInput
                    id="proofOfIdentificationNumber"
                    type="text"
                    name="proofOfIdentificationNumber"
                    value={formData.proofOfIdentificationNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your ID number"
                    required
                    pattern="\d+"
                    disabled={loading}
                    color={errors.proofOfIdentificationNumber ? 'failure' : 'gray'}
                    className="mt-1"
                  />
                  {errors.proofOfIdentificationNumber && <p className="text-red-600 text-sm mt-1">{errors.proofOfIdentificationNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hospitalName" value="Hospital Name" className="text-gray-700" />
                  <TextInput
                    id="hospitalName"
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleInputChange}
                    placeholder="Enter hospital name"
                    required
                    disabled={loading}
                    color={errors.hospitalName ? 'failure' : 'gray'}
                    className="mt-1"
                  />
                  {errors.hospitalName && <p className="text-red-600 text-sm mt-1">{errors.hospitalName}</p>}
                </div>
                <div>
                  <Label htmlFor="address" value="Address" className="text-gray-700" />
                  <TextInput
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    required
                    disabled={loading}
                    color={errors.address ? 'failure' : 'gray'}
                    className="mt-1"
                  />
                  {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phoneNumber" value="Phone Number" className="text-gray-700" />
                  <TextInput
                    id="phoneNumber"
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit phone number"
                    required
                    pattern="\d{10}"
                    maxLength={10}
                    disabled={loading}
                    color={errors.phoneNumber ? 'failure' : 'gray'}
                    className="mt-1"
                  />
                  {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>}
                </div>
                <div>
                  <Label htmlFor="patientBlood" value="Blood Type Needed" className="text-gray-700" />
                  <Select
                    id="patientBlood"
                    name="patientBlood"
                    value={formData.patientBlood}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    color={errors.patientBlood ? 'failure' : 'gray'}
                    className="mt-1"
                  >
                    <option value="">Select Blood Type</option>
                    {bloodTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Select>
                  {errors.patientBlood && <p className="text-red-600 text-sm mt-1">{errors.patientBlood}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="units" value="Number of Units" className="text-gray-700" />
                  <TextInput
                    id="units"
                    type="number"
                    name="units"
                    value={formData.units}
                    onChange={handleInputChange}
                    placeholder="Enter required units"
                    required
                    min="1"
                    disabled={loading}
                    color={errors.units ? 'failure' : 'gray'}
                    className="mt-1"
                  />
                  {errors.units && <p className="text-red-600 text-sm mt-1">{errors.units}</p>}
                </div>
                <div>
                  <Label htmlFor="criticalLevel" value="Critical Level" className="text-gray-700" />
                  <Select
                    id="criticalLevel"
                    name="criticalLevel"
                    value={formData.criticalLevel}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    color={errors.criticalLevel ? 'failure' : 'gray'}
                    className="mt-1"
                  >
                    {criticalLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Select>
                  {errors.criticalLevel && <p className="text-red-600 text-sm mt-1">{errors.criticalLevel}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="withinDate" value="Needed By" className="text-gray-700" />
                <Datepicker
                  id="withinDate"
                  name="withinDate"
                  selected={formData.withinDate}
                  onChange={handleDateChange}
                  minDate={today}
                  required
                  disabled={loading}
                  className={`mt-1 ${errors.withinDate ? 'border-red-500' : ''}`}
                />
                {errors.withinDate && <p className="text-red-600 text-sm mt-1">{errors.withinDate}</p>}
              </div>

              <div>
                <Label htmlFor="image" value="Upload Image (Optional)" className="text-gray-700" />
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-2 w-full text-gray-700 border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 disabled:opacity-50"
                  disabled={loading}
                />
                {imagePreview && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Uploaded Preview"
                      className="max-w-xs border-2 border-red-300 rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                gradientDuoTone="redToPink"
                size="lg"
                className="w-full mt-6 shadow-lg hover:shadow-xl transition-shadow"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
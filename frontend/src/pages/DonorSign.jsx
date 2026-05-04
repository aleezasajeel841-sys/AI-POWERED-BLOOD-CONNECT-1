import React, { useState } from "react";
import { Button, Card, Label, TextInput, Select, FileInput, Spinner } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { useDonor } from "../hooks/donor";
import { toast } from 'react-toastify';

export default function DonorSign() {
  const navigate = useNavigate();
  const { createDonor, loading } = useDonor();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    dob: "",
    bloodType: "",
    gender: "",
    city: "",
    nic: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const genders = ["Male", "Female", "Other"];

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

    // Name validations
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    // Phone validation (exactly 10 digits)
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation (min 8 chars, at least one special character)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    // Date of Birth validation (must be at least 18 years old)
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const dobDate = new Date(formData.dob);
      if (dobDate >= today) {
        newErrors.dob = 'Date of birth must be in the past';
      } else if (dobDate > minAgeDate) {
        newErrors.dob = 'You must be at least 18 years old';
      }
    }

    // Blood type validation
    if (!formData.bloodType) newErrors.bloodType = 'Blood type is required';

    // Gender validation
    if (!formData.gender) newErrors.gender = 'Gender is required';

    // City validation
    if (!formData.city.trim()) newErrors.city = 'City is required';

    // NIC validation (exactly 12 digits)
    if (!formData.nic) {
      newErrors.nic = 'NIC is required';
    } else if (!/^\d{12}$/.test(formData.nic)) {
      newErrors.nic = 'NIC must be exactly 12 digits';
    }

    // Image validation
    if (!formData.image) newErrors.image = 'Donor image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleNumericChange = (e) => {
    const { id, value } = e.target;
    if (/^\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [id]: value }));
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(null);
    }
    setErrors((prev) => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const donorData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      donorData.append(key, value);
    });

    try {
      await createDonor(donorData);
      toast.success('Registration successful! Please log in.');
      navigate("/donor-login");
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error registering donor');
    }
  };

  // Calculate max date for DOB (18 years ago)
  const today = new Date();
  const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const maxDob = minAgeDate.toISOString().split('T')[0];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 p-6">
      <Card className="w-full max-w-5xl p-12 shadow-xl rounded-3xl bg-white bg-opacity-90 backdrop-blur-xl border border-red-100 transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-10 drop-shadow-lg">
          Donor Registration
        </h2>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
          <div className="space-y-8">
            <div>
              <Label htmlFor="firstName" value="First Name" className="text-gray-800 font-semibold" />
              <TextInput
                id="firstName"
                type="text"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
                color={errors.firstName ? 'failure' : 'gray'}
                className="mt-2 rounded-xl border-red-100 focus:ring-red-300 focus:border-red-300 transition-all duration-200"
                helperText={errors.firstName && <span className="text-red-600 text-sm">{errors.firstName}</span>}
              />
            </div>

            <div>
              <Label htmlFor="lastName" value="Last Name" className="text-gray-800 font-semibold" />
              <TextInput
                id="lastName"
                type="text"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
                color={errors.lastName ? 'failure' : 'gray'}
                className="mt-2 rounded-xl border-red-100 focus:ring-red-300 focus:border-red-300 transition-all duration-200"
                helperText={errors.lastName && <span className="text-red-600 text-sm">{errors.lastName}</span>}
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber" value="Phone Number" className="text-gray-800 font-semibold" />
              <TextInput
                id="phoneNumber"
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={formData.phoneNumber}
                onChange={handleNumericChange}
                required
                maxLength={10}
                disabled={loading}
                color={errors.phoneNumber ? 'failure' : 'gray'}
                className="mt-2 rounded-xl border-red-100 focus:ring-red-300 focus:border-red-300 transition-all duration-200"
                helperText={errors.phoneNumber && <span className="text-red-600 text-sm">{errors.phoneNumber}</span>}
              />
            </div>

            <div>
              <Label htmlFor="email" value="Email" className="text-gray-800 font-semibold" />
              <TextInput
                id="email"
                type="email"
                placeholder="donor@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                color={errors.email ? 'failure' : 'gray'}
                className="mt-2 rounded-xl border-red-100 focus:ring-red-300 focus:border-red-300 transition-all duration-200"
                helperText={errors.email && <span className="text-red-600 text-sm">{errors.email}</span>}
              />
            </div>

            <div>
              <Label htmlFor="password" value="Password" className="text-gray-800 font-semibold" />
              <TextInput
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                disabled={loading}
                color={errors.password ? 'failure' : 'gray'}
                className="mt-2 rounded-xl border-red-100 focus:ring-red-300 focus:border-red-300 transition-all duration-200"
                helperText={errors.password && <span className="text-red-600 text-sm">{errors.password}</span>}
              />
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <Label htmlFor="dob" value="Date of Birth" className="text-gray-800 font-semibold" />
              <TextInput
                id="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                required
                max={maxDob}
                disabled={loading}
                color={errors.dob ? 'failure' : 'gray'}
                className="mt-2 rounded-xl border-red-100 focus:ring-red-300 focus:border-red-300 transition-all duration-200"
                helperText={errors.dob && <span className="text-red-600 text-sm">{errors.dob}</span>}
              />
            </div>

            <div>
              <Label htmlFor="city" value="City" className="text-gray-800 font-semibold" />
              <TextInput
                id="city"
                type="text"
                placeholder="Enter city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={loading}
                color={errors.city ? 'failure' : 'gray'}
                className="mt-2 rounded-xl border-red-100 focus:ring-red-300 focus:border-red-300 transition-all duration-200"
                helperText={errors.city && <span className="text-red-600 text-sm">{errors.city}</span>}
              />
            </div>

            <div>
              <Label htmlFor="nic" value="NIC" className="text-gray-800 font-semibold" />
              <TextInput
                id="nic"
                type="text"
                placeholder="Enter 12-digit NIC number"
                value={formData.nic}
                onChange={handleNumericChange}
                required
                maxLength={12}
                disabled={loading}
                color={errors.nic ? 'failure' : 'gray'}
                className="mt-2 rounded-xl border-red-100 focus:ring-red-300 focus:border-red-300 transition-all duration-200"
                helperText={errors.nic && <span className="text-red-600 text-sm">{errors.nic}</span>}
              />
            </div>

            <div>
              <Label htmlFor="bloodType" value="Blood Type" className="text-gray-800 font-semibold" />
              <Select
                id="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                required
                disabled={loading}
                color={errors.bloodType ? 'failure' : 'gray'}
                className="mt-2 rounded-xl border-red-100 focus:ring-red-300 focus:border-red-300 transition-all duration-200"
              >
                <option value="">Select Blood Type</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
              {errors.bloodType && <p className="text-red-600 text-sm mt-2">{errors.bloodType}</p>}
            </div>

            <div>
              <Label htmlFor="gender" value="Gender" className="text-gray-800 font-semibold" />
              <Select
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                disabled={loading}
                color={errors.gender ? 'failure' : 'gray'}
                className="mt-2 rounded-xl border-red-100 focus:ring-red-300 focus:border-red-300 transition-all duration-200"
              >
                <option value="">Select Gender</option>
                {genders.map((gender) => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </Select>
              {errors.gender && <p className="text-red-600 text-sm mt-2">{errors.gender}</p>}
            </div>

            <div>
              <Label htmlFor="image" value="Donor Image (JPG/PNG)" className="text-gray-800 font-semibold" />
              <FileInput
                id="image"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                required
                disabled={loading}
                color={errors.image ? "failure" : "gray"}
                className="mt-2 rounded-xl border-red-100 focus:ring-red-300 focus:border-red-300 transition-all duration-200"
                helperText={errors.image && <span className="text-red-600 text-sm">{errors.image}</span>}
              />
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="mt-4 w-40 h-40 object-cover rounded-xl shadow-md border border-red-100" 
                />
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col items-center space-y-6">
            <Button
              type="submit"
              gradientDuoTone="redToPink"
              size="xl"
              className="w-full max-w-md font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-red-500 to-pink-500"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-3" />
                  Registering...
                </>
              ) : (
                'Register Now'
              )}
            </Button>
            <button
              onClick={() => navigate("/donor-login")}
              className="text-red-600 font-semibold hover:text-pink-600 hover:underline focus:outline-none transition-colors duration-200"
              disabled={loading}
            >
              Already have an account? Login
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
import React, { useEffect, useRef, useState, useCallback } from 'react';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuthContext } from '../hooks/useAuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { useDonor } from '../hooks/donor';
import { useReceiver } from '../hooks/receiver';
import { useHospital } from '../hooks/hospital';
import Chart from 'chart.js/auto';
import { HiUsers, HiDocumentText, HiHeart, HiExclamation, HiOfficeBuilding } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { Button, Table } from 'flowbite-react';

export default function Dashboard() {
  const { user } = useAuthContext();
  const { data, loading: dashboardLoading } = useDashboardData();
  const { donors, fetchDonors } = useDonor();
  const { receivers, fetchReceivers } = useReceiver();
  const { hospitals, fetchHospitals } = useHospital();
  const [isLoading, setIsLoading] = useState(true);
  const userRole = user?.role;
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);

  // Fetch all data
  const loadAllData = useCallback(async () => {
    try {
      await Promise.all([
        fetchDonors(),
        fetchReceivers(),
        fetchHospitals()
      ]);
    } finally {
      // Set loading to false after data is fetched
      setIsLoading(false);
    }
  }, [fetchDonors, fetchReceivers, fetchHospitals]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Calculate stats from actual data
  const totalDonors = donors?.length || 0;
  const totalReceivers = receivers ? (Array.isArray(receivers) ? receivers.length : 1) : 0;
  const totalHospitals = hospitals?.length || 0;
  const totalDonations = data?.totalDonations || 0;
  const totalRequests = data?.totalRequests || 0;
  const emergencyRequests = data?.emergencyRequests || 0;

  // Blood type distribution from donors
  const getBloodTypeDistribution = () => {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const distribution = bloodTypes.map(bt => {
      return donors?.filter(d => d.bloodType === bt).length || 0;
    });
    return distribution;
  };

  useEffect(() => {
    if (!isLoading) {
      // Create donation trends chart
      const donationTrendsCtx = document.getElementById('donationTrendsChart');
      if (donationTrendsCtx) {
        if (lineChartRef.current) {
          lineChartRef.current.destroy();
        }
        
        lineChartRef.current = new Chart(donationTrendsCtx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Donations',
              data: totalDonors > 0 ? [Math.floor(totalDonors * 0.4), Math.floor(totalDonors * 0.5), Math.floor(totalDonors * 0.6), Math.floor(totalDonors * 0.7), Math.floor(totalDonors * 0.8), totalDonors] : [12, 19, 15, 25, 22, 30],
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top'
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
      
      // Create blood type distribution chart
      const bloodTypeCtx = document.getElementById('bloodTypeChart');
      if (bloodTypeCtx) {
        if (pieChartRef.current) {
          pieChartRef.current.destroy();
        }
        
        pieChartRef.current = new Chart(bloodTypeCtx, {
          type: 'pie',
          data: {
            labels: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            datasets: [{
              data: totalDonors > 0 ? getBloodTypeDistribution() : [35, 8, 25, 5, 10, 2, 12, 3],
              backgroundColor: [
                '#ef4444', '#f87171', '#dc2626', '#b91c1c',
                '#7f1d1d', '#991b1b', '#f43f5e', '#e11d48'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'right'
              }
            }
          }
        });
      }
      
      return () => {
        if (lineChartRef.current) {
          lineChartRef.current.destroy();
        }
        if (pieChartRef.current) {
          pieChartRef.current.destroy();
        }
      };
    }
  }, [isLoading, donors, totalDonors]);

  if (isLoading) return <div className="flex h-screen items-center justify-center text-gray-600">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {!user && (
              <div className="mb-6 text-center">
                <Link to='/donor-login'>
                  <Button className='bg-secondary hover:bg-accent text-primary font-bold py-3 px-6'>Get Started</Button>
                </Link>
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
            
{/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-4 flex items-center">
                <div className="rounded-full bg-red-100 p-3 mr-4">
                  <HiUsers className="text-red-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Donors</p>
                  <p className="text-xl font-bold">{totalDonors}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 flex items-center">
                <div className="rounded-full bg-red-100 p-3 mr-4">
                  <HiUsers className="text-red-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Receivers</p>
                  <p className="text-xl font-bold">{totalReceivers}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 flex items-center">
                <div className="rounded-full bg-red-100 p-3 mr-4">
                  <HiOfficeBuilding className="text-red-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hospitals</p>
                  <p className="text-xl font-bold">{totalHospitals}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4 flex items-center">
                <div className="rounded-full bg-red-100 p-3 mr-4">
                  <HiExclamation className="text-red-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Emergency</p>
                  <p className="text-xl font-bold">{emergencyRequests}</p>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Donation Trends</h2>
                <div className="h-64">
                  <canvas id="donationTrendsChart"></canvas>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-4">Blood Type Distribution</h2>
                <div className="h-64">
                  <canvas id="bloodTypeChart"></canvas>
                </div>
              </div>
            </div>
            
{/* Lists Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Donors List */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recent Donors</h2>
                  <Link to="/donord" className="text-sm text-red-600 hover:text-red-800">View All</Link>
                </div>
                <div className="overflow-x-auto">
                  <Table hoverable className="min-w-full">
                    <Table.Head className="bg-red-50 text-red-800">
                      <Table.HeadCell className="px-3 py-2 text-xs">Name</Table.HeadCell>
                      <Table.HeadCell className="px-3 py-2 text-xs">Blood Type</Table.HeadCell>
                      <Table.HeadCell className="px-3 py-2 text-xs">City</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y divide-gray-200">
                      {donors && donors.length > 0 ? (
                        donors.slice(0, 5).map((donor) => (
                          <Table.Row key={donor._id} className="bg-white">
                            <Table.Cell className="px-3 py-2 text-sm">{donor.firstName} {donor.lastName}</Table.Cell>
                            <Table.Cell className="px-3 py-2 text-sm font-semibold text-red-600">{donor.bloodType || 'N/A'}</Table.Cell>
                            <Table.Cell className="px-3 py-2 text-sm">{donor.city || 'N/A'}</Table.Cell>
                          </Table.Row>
                        ))
                      ) : (
                        <Table.Row>
                          <Table.Cell colSpan="3" className="px-3 py-4 text-center text-sm text-gray-500">No donors found</Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table>
                </div>
              </div>
              
              {/* Receivers List */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recent Receivers</h2>
                  <Link to="/receiverd" className="text-sm text-red-600 hover:text-red-800">View All</Link>
                </div>
                <div className="overflow-x-auto">
                  <Table hoverable className="min-w-full">
                    <Table.Head className="bg-red-50 text-red-800">
                      <Table.HeadCell className="px-3 py-2 text-xs">Name</Table.HeadCell>
                      <Table.HeadCell className="px-3 py-2 text-xs">Blood Type</Table.HeadCell>
                      <Table.HeadCell className="px-3 py-2 text-xs">City</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y divide-gray-200">
                      {receivers && (Array.isArray(receivers) ? receivers.length : 1) > 0 ? (
                        (Array.isArray(receivers) ? receivers.slice(0, 5) : [receivers]).map((receiver) => (
                          <Table.Row key={receiver._id} className="bg-white">
                            <Table.Cell className="px-3 py-2 text-sm">{receiver.firstName} {receiver.lastName}</Table.Cell>
                            <Table.Cell className="px-3 py-2 text-sm font-semibold text-red-600">{receiver.bloodType || 'N/A'}</Table.Cell>
                            <Table.Cell className="px-3 py-2 text-sm">{receiver.city || 'N/A'}</Table.Cell>
                          </Table.Row>
                        ))
                      ) : (
                        <Table.Row>
                          <Table.Cell colSpan="3" className="px-3 py-4 text-center text-sm text-gray-500">No receivers found</Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table>
                </div>
              </div>
              
              {/* Hospitals List */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Hospitals</h2>
                  <Link to="/hospitald" className="text-sm text-red-600 hover:text-red-800">View All</Link>
                </div>
                <div className="overflow-x-auto">
                  <Table hoverable className="min-w-full">
                    <Table.Head className="bg-red-50 text-red-800">
                      <Table.HeadCell className="px-3 py-2 text-xs">Name</Table.HeadCell>
                      <Table.HeadCell className="px-3 py-2 text-xs">City</Table.HeadCell>
                      <Table.HeadCell className="px-3 py-2 text-xs">Phone</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y divide-gray-200">
                      {hospitals && hospitals.length > 0 ? (
                        hospitals.slice(0, 5).map((hospital) => (
                          <Table.Row key={hospital._id} className="bg-white">
                            <Table.Cell className="px-3 py-2 text-sm">{hospital.name}</Table.Cell>
                            <Table.Cell className="px-3 py-2 text-sm">{hospital.city || 'N/A'}</Table.Cell>
                            <Table.Cell className="px-3 py-2 text-sm">{hospital.phoneNumber || 'N/A'}</Table.Cell>
                          </Table.Row>
                        ))
                      ) : (
                        <Table.Row>
                          <Table.Cell colSpan="3" className="px-3 py-4 text-center text-sm text-gray-500">No hospitals found</Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

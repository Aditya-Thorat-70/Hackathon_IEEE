const Doctor = require('../Models/Doctor');
const Patient = require('../Models/Patient');
const Review = require('../Models/Review');
const User = require('../Models/User');
const multer = require('multer');

// Get all doctors (public route)
exports.getAllDoctors = async (req, res) => {
    try {
        console.log('Fetching all doctors...');
        const doctors = await Doctor.find()
            .populate('userId', 'name email phoneNo gender address')
            .select('-__v');
        
        console.log('Doctors found:', doctors.length);
        
        const doctorsWithUserData = doctors.map(doctor => {
            console.log('Doctor data:', {
                _id: doctor._id,
                userId: doctor.userId,
                name: doctor.userId?.name,
            });
            
            return {
                _id: doctor._id,
                userId: doctor.userId,
                specialization: doctor.specialization,
                qualification: doctor.qualification,
                experiance: doctor.experience, // Fix field name
                licenceNo: doctor.licenceNo,
                HospitalName: doctor.hospitalName, // Fix field name
                fees: doctor.fees,
                name: doctor.userId?.name || 'Unknown',
                email: doctor.userId?.email || '',
                phoneNo: doctor.userId?.phoneNo || '',
                gender: doctor.userId?.gender || '',
                address: doctor.userId?.address || ''
            };
        });
        
        console.log('Processed doctors data:', doctorsWithUserData.length);
        res.json(doctorsWithUserData);
    } catch (error) {
        console.error('Error in getAllDoctors:', error);
        res.status(500).json({ message: "Error fetching doctors", error: error.message });
    }
};

// Get all patients assigned to doctor
exports.getMyPatients = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        
        const patients = await Patient.find({ doctor: doctor._id })
            .populate('userId', 'name email phoneNo gender address');
        
        const patientsWithUserData = patients.map(patient => ({
            _id: patient._id,
            userId: {
                _id: patient.userId?._id,
                name: patient.userId?.name || 'Unknown',
                email: patient.userId?.email || '',
                phoneNo: patient.userId?.phoneNo || '',
                gender: patient.userId?.gender || '',
                address: patient.userId?.address || ''
            }
        }));
        
        res.json(patientsWithUserData);
    } catch (error) {
        console.error('Error in getMyPatients:', error);
        res.status(500).json({ message: "Error fetching patients", error: error.message });
    }
};

// Get reviews for logged-in doctor
exports.getMyReviews = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        
        const reviews = await Review.find({ doctor: doctor._id })
            .populate('patient', 'name email')
            .populate('doctor', 'specialization');
        res.json(reviews);
    } catch (error) {
        console.error('Error in getMyReviews:', error);
        res.status(500).json({ message: "Error fetching reviews", error: error.message });
    }
};

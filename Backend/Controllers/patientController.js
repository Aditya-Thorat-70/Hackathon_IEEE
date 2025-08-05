// Data integrity enforced: Patient creation requires valid user and doctor references.
const Patient = require('../Models/Patient');
const Review = require('../Models/Review');
const Appointments = require('../Models/Appointments');
// GET patient dashboard (doctor info + reviews if assigned)
exports.getDashboard = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.user.id }).populate({
            path: 'doctor',
            populate: { path: 'userId', select: 'name email' },
        });

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        if (!patient.doctor) {
            return res.status(200).json({
                doctor: null,
                reviews: [],
                message: "No doctor assigned yet",
            });
        }

        const reviews = await Review.find({ doctor: patient.doctor._id });

        res.status(200).json({
            doctor: patient.doctor,
            reviews,
        });
    } catch (err) {
        console.error("❌ Dashboard error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
exports.getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointments.find({ patient: req.params.id })
            .populate({
                path: 'doctor',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            });

        if (!appointments || appointments.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(appointments);
    } catch (error) {
        console.error("❌ Error fetching patient appointments:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
// PATCH assign doctor to patient
exports.assignDoctor = async (req, res) => {
    try {
        const { doctorId } = req.body;

        const patient = await Patient.findOne({ userId: req.user.id });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        patient.doctor = doctorId;
        await patient.save();

        res.status(200).json({
            message: "Doctor assigned successfully",
            doctor: patient.doctor,
        });
    } catch (err) {
        console.error("❌ Assign doctor error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
// Create patient (add if not present)
exports.createPatient = async (req, res) => {
  try {
    const { userId, doctorId } = req.body;
    // Validate user
    const user = await require('../Models/User').findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    // Validate doctor
    const doctor = await require('../Models/Doctor').findById(doctorId);
    if (!doctor) {
      return res.status(400).json({ message: "Invalid doctorId" });
    }
    // Create patient
    const patient = await Patient.create({ userId: user._id, doctor: doctor._id });
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ message: "Failed to create patient", error: err.message });
  }
};

// Get or create patient profile for current user
exports.getOrCreatePatient = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if patient already exists
    let patient = await Patient.findOne({ userId });
    
    if (!patient) {
      // Create a new patient profile without assigning a doctor
      patient = await Patient.create({ userId });
    }
    
    res.status(200).json(patient);
  } catch (err) {
    console.error("❌ Get or create patient error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

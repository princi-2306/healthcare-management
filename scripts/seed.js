/**
 * Database seed script
 * Run: node scripts/seed.js
 *
 * Seeds the database with:
 * - 1 admin user
 * - 5 sample doctors with profiles
 *
 * Requires MONGODB_URI in .env.local
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

// Load env (.env or .env.local)
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env or .env.local");
  process.exit(1);
}

// --- Inline schemas (to avoid ESM/import issues) ---
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
  image: { type: String, default: null },
}, { timestamps: true });

const DoctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  specialisation: String,
  qualification: String,
  experience: Number,
  bio: String,
  phone: String,
  consultationFee: Number,
  slotDurationMins: { type: Number, default: 30 },
  workingHours: [{
    dayOfWeek: Number,
    startTime: String,
    endTime: String,
    isActive: { type: Boolean, default: true },
  }],
  leaveDays: [{ date: Date, reason: String }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const DoctorProfile = mongoose.models.DoctorProfile || mongoose.model("DoctorProfile", DoctorProfileSchema);

// --- Seed Data ---
const DEFAULT_PASSWORD = "Admin@123";

const doctors = [
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@healthcare.app",
    specialisation: "Cardiology",
    qualification: "MBBS, MD (Cardiology)",
    experience: 12,
    bio: "Board-certified cardiologist with over 12 years of experience in diagnosing and treating heart conditions.",
    phone: "+91 98765 43210",
    consultationFee: 1500,
    slotDurationMins: 30,
  },
  {
    name: "Rajesh Patel",
    email: "rajesh.patel@healthcare.app",
    specialisation: "Dermatology",
    qualification: "MBBS, MD (Dermatology)",
    experience: 8,
    bio: "Experienced dermatologist specialising in skin diseases, cosmetic procedures, and hair disorders.",
    phone: "+91 98765 43211",
    consultationFee: 1000,
    slotDurationMins: 20,
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@healthcare.app",
    specialisation: "Pediatrics",
    qualification: "MBBS, DCH, DNB (Pediatrics)",
    experience: 15,
    bio: "Dedicated pediatrician with 15 years of experience in child healthcare, vaccinations, and developmental assessments.",
    phone: "+91 98765 43212",
    consultationFee: 800,
    slotDurationMins: 30,
  },
  {
    name: "Michael Chen",
    email: "michael.chen@healthcare.app",
    specialisation: "Orthopedics",
    qualification: "MBBS, MS (Orthopedics)",
    experience: 10,
    bio: "Orthopedic surgeon specialising in joint replacements, sports injuries, and spinal disorders.",
    phone: "+91 98765 43213",
    consultationFee: 1200,
    slotDurationMins: 30,
  },
  {
    name: "Anita Desai",
    email: "anita.desai@healthcare.app",
    specialisation: "General Medicine",
    qualification: "MBBS, MD (Internal Medicine)",
    experience: 20,
    bio: "Senior physician with expertise in managing chronic diseases, preventive healthcare, and general medical conditions.",
    phone: "+91 98765 43214",
    consultationFee: 700,
    slotDurationMins: 20,
  },
];

const defaultWorkingHours = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "13:00", isActive: true },
  { dayOfWeek: 1, startTime: "14:00", endTime: "17:00", isActive: true },
  { dayOfWeek: 2, startTime: "09:00", endTime: "13:00", isActive: true },
  { dayOfWeek: 2, startTime: "14:00", endTime: "17:00", isActive: true },
  { dayOfWeek: 3, startTime: "09:00", endTime: "13:00", isActive: true },
  { dayOfWeek: 3, startTime: "14:00", endTime: "17:00", isActive: true },
  { dayOfWeek: 4, startTime: "09:00", endTime: "13:00", isActive: true },
  { dayOfWeek: 4, startTime: "14:00", endTime: "17:00", isActive: true },
  { dayOfWeek: 5, startTime: "09:00", endTime: "13:00", isActive: true },
  { dayOfWeek: 5, startTime: "14:00", endTime: "17:00", isActive: true },
  { dayOfWeek: 6, startTime: "10:00", endTime: "14:00", isActive: true },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    // 1. Create admin user
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@healthcare.app";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";
    const ADMIN_NAME = process.env.ADMIN_NAME || "System Admin";

    const adminSalt = await bcrypt.genSalt(12);
    const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, adminSalt);

    console.log("Creating admin user...");
    let admin = await User.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        passwordHash: adminPasswordHash,
        role: "admin",
      });
      console.log(`  ✅ Admin created: ${ADMIN_EMAIL}`);
    } else {
      console.log(`  ⏭  Admin already exists: ${ADMIN_EMAIL}`);
    }

    // 2. Create sample doctors
    console.log("\nCreating sample doctors...");
    for (const doc of doctors) {
      let user = await User.findOne({ email: doc.email });
      if (!user) {
        user = await User.create({
          name: doc.name,
          email: doc.email,
          passwordHash,
          role: "doctor",
        });

        await DoctorProfile.create({
          userId: user._id,
          specialisation: doc.specialisation,
          qualification: doc.qualification,
          experience: doc.experience,
          bio: doc.bio,
          phone: doc.phone,
          consultationFee: doc.consultationFee,
          slotDurationMins: doc.slotDurationMins,
          workingHours: defaultWorkingHours,
        });

        console.log(`  ✅ Dr. ${doc.name} (${doc.specialisation})`);
      } else {
        console.log(`  ⏭  Dr. ${doc.name} already exists`);
      }
    }

    // 3. Create a sample patient
    console.log("\nCreating sample patient...");
    let patient = await User.findOne({ email: "patient@healthcare.app" });
    if (!patient) {
      patient = await User.create({
        name: "Test Patient",
        email: "patient@healthcare.app",
        passwordHash,
        role: "patient",
      });
      console.log("  ✅ Patient created: patient@healthcare.app");
    } else {
      console.log("  ⏭  Patient already exists");
    }

    console.log("\n========================================");
    console.log("Seed completed successfully!");
    console.log("========================================");
    console.log(`\nDefault password for all users: ${DEFAULT_PASSWORD}`);
    console.log("\nAccounts:");
    console.log("  Admin:   admin@healthcare.app");
    console.log("  Patient: patient@healthcare.app");
    doctors.forEach((d) => {
      console.log(`  Doctor:  ${d.email}`);
    });
    console.log("");
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();

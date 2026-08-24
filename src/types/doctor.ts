export interface Doctor {
  _id: string;
  name: string;
  email: string;
  image: string | null;
  role: "doctor";
}

export interface DoctorProfile {
  _id: string;
  userId: string;
  specialisation: string;
  qualification: string;
  experience: number;
  bio: string;
  phone: string;
  consultationFee: number;
  slotDurationMins: number;
  workingHours: WorkingHours[];
  leaveDays: LeaveDay[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHours {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isActive: boolean;
}

export interface LeaveDay {
  date: Date;
  reason: string;
}

export interface Slot {
  _id: string;
  doctorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: "available" | "held" | "booked" | "cancelled" | "blocked";
}

export interface DoctorWithProfile extends Doctor {
  profile?: DoctorProfile;
}

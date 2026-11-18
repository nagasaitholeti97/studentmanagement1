import type { ClassStudent } from "../types";

// Keys must match your class ids (check the ids in your mock getFacultyClasses()).
export const CLASS_STUDENTS: Record<string, ClassStudent[]> = {
    "1c": [ // 1-Year ECE-C
        { studentId: "s-1c-001", rollNo: "ECE-1C-001", name: "Aarav Mehta" },
        { studentId: "s-1c-002", rollNo: "ECE-1C-002", name: "Diya Patel" },
        { studentId: "s-1c-003", rollNo: "ECE-1C-003", name: "Kabir Joshi" },
        { studentId: "s-1c-004", rollNo: "ECE-1C-004", name: "Nisha Iyer" },
        { studentId: "s-1c-005", rollNo: "ECE-1C-005", name: "Rahul Menon" },
        { studentId: "s-1c-006", rollNo: "ECE-1C-006", name: "Tanvi Kulkarni" },
    ],
    "2b": [ // 2-Year ECE-B
        { studentId: "s-2b-001", rollNo: "ECE-2B-001", name: "Arjun Naidu" },
        { studentId: "s-2b-002", rollNo: "ECE-2B-002", name: "Bhavana Rao" },
        { studentId: "s-2b-003", rollNo: "ECE-2B-003", name: "Charan Teja" },
        { studentId: "s-2b-004", rollNo: "ECE-2B-004", name: "Divya Prasad" },
        { studentId: "s-2b-005", rollNo: "ECE-2B-005", name: "Eshwar Reddy" },
        { studentId: "s-2b-006", rollNo: "ECE-2B-006", name: "Farhan Ali" },
    ],
    "3a": [ // 3-Year ECE-A (contains the demo login student)
        { studentId: "s-3a-021", rollNo: "22EC1021", name: "Gautham Varma" },
        { studentId: "s-3a-022", rollNo: "22EC1022", name: "Harini Krishnan" },
        { studentId: "s-3a-023", rollNo: "22EC1023", name: "Imran Khan" },
        { studentId: "s-3a-024", rollNo: "22EC1024", name: "Ananya Sharma" }, // must match the demo student's profile
        { studentId: "s-3a-025", rollNo: "22EC1025", name: "Jyothi Lakshmi" },
        { studentId: "s-3a-026", rollNo: "22EC1026", name: "Kiran Kumar" },
    ],
};
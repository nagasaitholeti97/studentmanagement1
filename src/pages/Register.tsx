
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

type UserRole = "student" | "faculty";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function Register() {
    const navigate = useNavigate();

    const [role, setRole] = useState<UserRole>("student");

    // Common details
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Student academic details
    const [studentId, setStudentId] = useState("");
    const [department, setDepartment] = useState("");
    const [year, setYear] = useState("");
    const [section, setSection] = useState("");

    // Student personal details
    const [gender, setGender] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [personalEmail, setPersonalEmail] = useState("");
    const [phone, setPhone] = useState("");

    // Parents details
    const [fatherName, setFatherName] = useState("");
    const [motherName, setMotherName] = useState("");
    const [parentPhone, setParentPhone] = useState("");

    // Address details
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [pincode, setPincode] = useState("");

    // Faculty details
    const [facultyId, setFacultyId] = useState("");
    const [facultyCode, setFacultyCode] = useState("");
    const [facultyGender, setFacultyGender] = useState("");
    const [facultyPhone, setFacultyPhone] = useState("");
    const [facultyPersonalEmail, setFacultyPersonalEmail] = useState("");
    const [designation, setDesignation] = useState("");
    const [qualification, setQualification] = useState("");
    const [age, setAge] = useState("");
    const [experienceYears, setExperienceYears] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleRegister(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (role === "student") {
            if (!studentId.trim()) {
                setError("Student roll number is required.");
                return;
            }

            if (!/^[6-9]\d{9}$/.test(phone)) {
                setError("Enter a valid 10-digit phone number.");
                return;
            }

            if (!/^[6-9]\d{9}$/.test(parentPhone)) {
                setError("Enter a valid 10-digit parent contact number.");
                return;
            }

            if (!/^\d{6}$/.test(pincode)) {
                setError("Enter a valid 6-digit pincode.");
                return;
            }
        }

        if (role === "faculty") {
            if (!facultyId.trim()) {
                setError("Faculty ID is required.");
                return;
            }

            if (!facultyCode.trim()) {
                setError("Faculty registration code is required.");
                return;
            }

            if (!/^[6-9]\d{9}$/.test(facultyPhone)) {
                setError("Enter a valid 10-digit faculty phone number.");
                return;
            }

            if (!age || Number(age) < 18 || Number(age) > 100) {
                setError("Enter a valid age between 18 and 100.");
                return;
            }

            if (
                experienceYears === "" ||
                Number(experienceYears) < 0
            ) {
                setError("Enter valid experience in years.");
                return;
            }
        }

        setLoading(true);

        try {
            const payload = {
                name: name.trim(),
                email: email.trim(),
                password,
                role: role.toUpperCase(),

                ...(role === "student"
                    ? {
                        studentId: studentId.trim(),
                        department,
                        year,
                        section,
                        gender,
                        dateOfBirth,
                        personalEmail: personalEmail.trim(),
                        phone: phone.trim(),
                        fatherName: fatherName.trim(),
                        motherName: motherName.trim(),
                        parentPhone: parentPhone.trim(),
                        address: address.trim(),
                        city: city.trim(),
                        state: state.trim(),
                        pincode: pincode.trim(),
                    }
                    : {
                        facultyId: facultyId.trim(),
                        facultyCode: facultyCode.trim(),
                        department,
                        gender: facultyGender,
                        phone: facultyPhone.trim(),
                        personalEmail: facultyPersonalEmail.trim(),
                        designation: designation.trim(),
                        qualification: qualification.trim(),
                        age: Number(age),
                        experienceYears: Number(experienceYears),
                    }),
            };

            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    `Registration failed. Server returned ${response.status}.`
                );
            }

            setSuccess(
                "Registration successful! Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1500);

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to connect to the backend."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-tint px-4 py-10">
            <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">

                <div className="text-center mb-7">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Create Account
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Student Attendance Management System
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Register As
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setRole("student")}
                                className={`rounded-lg border p-3 font-semibold transition ${role === "student"
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-slate-600 border-slate-300"
                                    }`}
                            >
                                Student
                            </button>

                            <button
                                type="button"
                                onClick={() => setRole("faculty")}
                                className={`rounded-lg border p-3 font-semibold transition ${role === "faculty"
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-slate-600 border-slate-300"
                                    }`}
                            >
                                Faculty
                            </button>
                        </div>
                    </div>

                    {/* Common Details */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            className="input w-full"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="input w-full"
                            placeholder="Enter your login email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            className="input w-full"
                            placeholder="Create password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            className="input w-full"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Student Registration */}
                    {role === "student" && (
                        <>
                            <div className="border-t pt-4">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Academic Details
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Student Roll Number
                                </label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="Enter roll number"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Department
                                </label>
                                <select
                                    className="input w-full"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                >
                                    <option value="">Select department</option>
                                    <option value="CSE">Computer Science</option>
                                    <option value="ECE">Electronics</option>
                                    <option value="EEE">Electrical</option>
                                    <option value="MECH">Mechanical</option>
                                    <option value="CIVIL">Civil</option>
                                    <option value="IT">Information Technology</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Academic Year
                                </label>
                                <select
                                    className="input w-full"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    required
                                >
                                    <option value="">Select year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Section
                                </label>
                                <select
                                    className="input w-full"
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    required
                                >
                                    <option value="">Select section</option>
                                    <option value="A">Section A</option>
                                    <option value="B">Section B</option>
                                    <option value="C">Section C</option>
                                </select>
                            </div>

                            {/* Student Personal Details */}
                            <div className="border-t pt-4">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Personal Details
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Gender
                                </label>
                                <select
                                    className="input w-full"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    className="input w-full"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    max={new Date().toISOString().split("T")[0]}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Personal Email
                                </label>
                                <input
                                    type="email"
                                    className="input w-full"
                                    placeholder="Enter personal email"
                                    value={personalEmail}
                                    onChange={(e) => setPersonalEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    className="input w-full"
                                    placeholder="10-digit mobile number"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                                    }
                                    maxLength={10}
                                    required
                                />
                            </div>

                            {/* Parents Details */}
                            <div className="border-t pt-4">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Parents Details
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Father's Name
                                </label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="Enter father's name"
                                    value={fatherName}
                                    onChange={(e) => setFatherName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Mother's Name
                                </label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="Enter mother's name"
                                    value={motherName}
                                    onChange={(e) => setMotherName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Parent Contact Number
                                </label>
                                <input
                                    type="tel"
                                    className="input w-full"
                                    placeholder="10-digit parent mobile number"
                                    value={parentPhone}
                                    onChange={(e) =>
                                        setParentPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                                    }
                                    maxLength={10}
                                    required
                                />
                            </div>

                            {/* Address Details */}
                            <div className="border-t pt-4">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Address Details
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Address
                                </label>
                                <textarea
                                    className="input w-full"
                                    placeholder="Enter house number, street and area"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="Enter city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    State
                                </label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="Enter state"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Pincode
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="input w-full"
                                    placeholder="6-digit pincode"
                                    value={pincode}
                                    onChange={(e) =>
                                        setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                                    }
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Faculty Registration */}
                    {role === "faculty" && (
                        <>
                            <div className="border-t pt-4">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Faculty Details
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Faculty ID
                                </label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="Enter faculty ID"
                                    value={facultyId}
                                    onChange={(e) => setFacultyId(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Faculty Registration Code
                                </label>
                                <input
                                    type="password"
                                    className="input w-full"
                                    placeholder="Enter faculty registration code"
                                    value={facultyCode}
                                    onChange={(e) => setFacultyCode(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Department
                                </label>
                                <select
                                    className="input w-full"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                >
                                    <option value="">Select department</option>
                                    <option value="CSE">Computer Science</option>
                                    <option value="ECE">Electronics</option>
                                    <option value="EEE">Electrical</option>
                                    <option value="MECH">Mechanical</option>
                                    <option value="CIVIL">Civil</option>
                                    <option value="IT">Information Technology</option>
                                </select>
                            </div>

                            <div className="border-t pt-4">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Faculty Personal Details
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Gender
                                </label>
                                <select
                                    className="input w-full"
                                    value={facultyGender}
                                    onChange={(e) => setFacultyGender(e.target.value)}
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    className="input w-full"
                                    placeholder="10-digit mobile number"
                                    value={facultyPhone}
                                    onChange={(e) =>
                                        setFacultyPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                                    }
                                    maxLength={10}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Personal Email
                                </label>
                                <input
                                    type="email"
                                    className="input w-full"
                                    placeholder="Enter personal email"
                                    value={facultyPersonalEmail}
                                    onChange={(e) => setFacultyPersonalEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Designation
                                </label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="Example: Assistant Professor"
                                    value={designation}
                                    onChange={(e) => setDesignation(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Qualification
                                </label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="Example: M.Tech, Ph.D"
                                    value={qualification}
                                    onChange={(e) => setQualification(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    className="input w-full"
                                    placeholder="Enter age"
                                    min={18}
                                    max={100}
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Experience (Years)
                                </label>
                                <input
                                    type="number"
                                    className="input w-full"
                                    placeholder="Enter experience in years"
                                    min={0}
                                    value={experienceYears}
                                    onChange={(e) => setExperienceYears(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn w-full"
                    >
                        {loading
                            ? "Creating Account..."
                            : `Register as ${role === "student" ? "Student" : "Faculty"}`}
                    </button>

                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-blue-600 hover:underline"
                    >
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}

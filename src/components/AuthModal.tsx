import React, { useState, useEffect } from 'react';
import { User, Classroom } from '../types';
import {
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  School,
  Lock,
  Mail,
  User as UserIcon,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  KeyRound,
  Info,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onAuthSuccess: (user: User, classroom: Classroom, message: string) => void;
  classrooms: Classroom[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
  classrooms,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form state (Institutional Mail & Password)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state (Name, Reg No, Department, Institutional Mail ID, Password)
  const [signupName, setSignupName] = useState('');
  const [signupRegNo, setSignupRegNo] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  // Single classroom enrollment choice
  const [enrollmentMode, setEnrollmentMode] = useState<'code' | 'select' | 'create'>('code');
  const [classroomCode, setClassroomCode] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState(classrooms[0]?.id || '');
  
  // New classroom state if creating during signup
  const [newCourseName, setNewCourseName] = useState('');
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newBatchYear, setNewBatchYear] = useState('');
  const [newSection, setNewSection] = useState('');

  // Helper to check institutional email domain
  const isInstitutionalDomain = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes('@')) return false;
    const domain = trimmed.split('@')[1] || '';
    return (
      domain.endsWith('.edu') ||
      domain.includes('.edu.') ||
      domain.endsWith('.ac') ||
      domain.includes('.ac.') ||
      domain.endsWith('.org') ||
      domain.includes('oxford') ||
      domain.includes('stanford') ||
      domain.includes('harvard') ||
      domain.includes('mit') ||
      domain.includes('cambridge') ||
      domain.includes('univ') ||
      domain.includes('college')
    );
  };

  const popularDepartments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electrical & Electronics Eng.',
    'Mechanical Engineering',
    'Data Science & AI',
    'Electronics & Comm. Eng.',
  ];

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your Institutional Mail ID.');
      setLoading(false);
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMessage('Please enter your password.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      confetti({ particleCount: 40, spread: 60 });
      onAuthSuccess(data.user, data.classroom, data.message || 'Logged in successfully!');
      onClose();
    } catch (err: any) {
      setErrorMessage('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Strict validation of the 5 required fields
    if (!signupName.trim()) {
      setErrorMessage('Please enter your Full Name.');
      setLoading(false);
      return;
    }
    if (!signupRegNo.trim()) {
      setErrorMessage('Please enter your Registration Number (Reg No).');
      setLoading(false);
      return;
    }
    if (!signupDepartment.trim()) {
      setErrorMessage('Please provide your Department.');
      setLoading(false);
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMessage('Please enter a valid Institutional Mail ID.');
      setLoading(false);
      return;
    }
    if (!signupPassword.trim()) {
      setErrorMessage('Please enter your institutional mail password (the password given by your institution for your mail).');
      setLoading(false);
      return;
    }
    if (signupPassword.trim().length < 6) {
      setErrorMessage('Institutional mail password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        name: signupName.trim(),
        regNo: signupRegNo.trim(),
        rollNumber: signupRegNo.trim(),
        department: signupDepartment.trim(),
        email: signupEmail.trim().toLowerCase(),
        password: signupPassword.trim(),
        classroomOption: enrollmentMode === 'create' ? 'create' : enrollmentMode === 'code' ? 'join' : 'select',
      };

      if (enrollmentMode === 'code') {
        payload.classroomCode = classroomCode.trim();
      } else if (enrollmentMode === 'select') {
        payload.classroomId = selectedClassroomId;
      } else if (enrollmentMode === 'create') {
        payload.newClassroomData = {
          course: newCourseName,
          collegeName: newCollegeName,
          department: signupDepartment,
          batchYear: newBatchYear,
          section: newSection,
          selectedSubjects: [],
        };
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create account.');
        setLoading(false);
        return;
      }

      confetti({ particleCount: 60, spread: 70 });
      onAuthSuccess(data.user, data.classroom, data.message || 'Account created successfully!');
      onClose();
    } catch (err) {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full bg-[#FDFCF8] text-[#1b1c1c] overflow-y-auto flex flex-col min-h-screen animate-in fade-in duration-200">
      {/* Sticky Full-Width Header Bar */}
      <header className="sticky top-0 z-20 w-full px-4 sm:px-8 md:px-12 py-4 sm:py-5 bg-white/95 backdrop-blur-md border-b border-[#E5E4E2] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F0EDED] hover:bg-[#E4E2E1] text-[#2d312e] hover:text-[#1b1c1c] text-sm sm:text-base font-bold transition-colors cursor-pointer shadow-xs"
            title="Back to previous screen"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Previous Screen</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#d9e6dc] text-[#56615a] flex items-center justify-center font-bold shadow-xs">
            <School className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg sm:text-xl font-black text-[#1b1c1c] tracking-tight">
              Academic Sanctuary
            </h1>
            <p className="text-xs text-[#737874] font-medium">Classroom Cohort Access Portal</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#56615a] hover:text-[#1b1c1c] hover:bg-[#F0EDED] text-sm sm:text-base font-bold transition-colors cursor-pointer"
          title="Close Auth Portal"
        >
          <span className="hidden sm:inline">Close</span>
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Main Full-Page Content Area */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-12 flex-grow flex flex-col gap-8">
        {/* Large Visible Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-[#EAE8E7] rounded-2xl text-base sm:text-lg font-bold shadow-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-3.5 sm:py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#1b1c1c] shadow-sm font-extrabold ring-1 ring-black/5'
                : 'text-[#56615a] hover:text-[#1b1c1c]'
            }`}
          >
            <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`py-3.5 sm:py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#1b1c1c] shadow-sm font-extrabold ring-1 ring-black/5'
                : 'text-[#56615a] hover:text-[#1b1c1c]'
            }`}
          >
            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Section Title */}
        <div>
          {mode === 'login' ? (
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1b1c1c] tracking-tight mb-2">
                Sign In with Institutional Account
              </h2>
              <p className="text-base sm:text-lg text-[#56615a]">
                Enter the official institutional email address and password given by your institution.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1b1c1c] tracking-tight mb-2">
                Create Account with Institutional Details
              </h2>
              <p className="text-base sm:text-lg text-[#56615a]">
                Sign up using your name, registration number, department, institutional mail ID, and your institutional mail password.
              </p>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 sm:p-5 bg-[#ffdad6] border-2 border-[#ffb4ab] rounded-2xl text-sm sm:text-base font-bold text-[#ba1a1a] flex items-center gap-3 shadow-xs">
            <Info className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {mode === 'login' ? (
          /* Sign In Form with Institutional Mail & Password */
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm sm:text-base font-bold text-[#2d312e] uppercase tracking-wide block">
                  Institutional Mail ID
                </label>
                <span className="text-xs text-[#56615a] font-bold bg-[#d9e6dc] px-2.5 py-0.5 rounded-full">
                  Given by Institution
                </span>
              </div>
              <div className="relative">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#56615a] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. name@institution.edu"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="paper-input w-full pl-12 sm:pl-14 pr-4 py-4 text-base sm:text-lg rounded-2xl bg-white border-2 border-[#D8D6D4] text-[#1b1c1c] font-medium shadow-xs focus:outline-none focus:border-[#56615a] focus:ring-2 focus:ring-[#56615a]/20"
                />
              </div>
              <p className="text-xs sm:text-sm text-[#737874] mt-1.5">
                Log in using the official email address issued by your college or university.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm sm:text-base font-bold text-[#2d312e] uppercase tracking-wide block">
                  Institutional Mail Password
                </label>
                <span className="text-xs text-[#56615a] font-bold bg-[#d9e6dc] px-2.5 py-0.5 rounded-full">
                  From Institution
                </span>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#56615a] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your institutional mail password..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="paper-input w-full pl-12 sm:pl-14 pr-12 py-4 text-base sm:text-lg rounded-2xl bg-white border-2 border-[#D8D6D4] text-[#1b1c1c] font-medium shadow-xs focus:outline-none focus:border-[#56615a] focus:ring-2 focus:ring-[#56615a]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737874] hover:text-[#1b1c1c] p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-[#737874] mt-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#56615a] flex-shrink-0" />
                <span>Enter the official mail password provided by your institution.</span>
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4.5 sm:py-5 bg-[#56615a] hover:bg-[#3e4641] disabled:opacity-50 text-white font-extrabold text-base sm:text-xl rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer"
              >
                <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>{loading ? 'Authenticating Profile...' : 'Sign In with Institutional Account'}</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm sm:text-base text-[#737874]">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-[#56615a] hover:underline cursor-pointer ml-1"
                >
                  Create Account with Institutional Details →
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* Sign Up Form with Name, Reg No, Department, Institutional Mail ID, and Password */
          <form onSubmit={handleSignupSubmit} className="space-y-6">
            <div className="bg-[#f7faf8] border-2 border-[#b2beb5] rounded-2xl p-4 flex items-start gap-3">
              <School className="w-5 h-5 text-[#56615a] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-extrabold text-[#1b1c1c]">Official Institution Registration</h4>
                <p className="text-xs text-[#56615a] leading-relaxed">
                  Please provide your official Name, Registration Number (Reg No), Department, Institutional Mail ID, and your <strong>Institutional Mail Password</strong> (the official password provided by your institution for your mail) to create your verified classroom profile.
                </p>
              </div>
            </div>

            {/* 1. Full Name & 2. Reg No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="text-sm sm:text-base font-bold text-[#2d312e] uppercase tracking-wide block mb-2">
                  Full Name <span className="text-[#ba1a1a]">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#56615a] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="paper-input w-full pl-12 sm:pl-14 pr-4 py-4 text-base sm:text-lg rounded-2xl bg-white border-2 border-[#D8D6D4] text-[#1b1c1c] font-medium shadow-xs focus:outline-none focus:border-[#56615a]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm sm:text-base font-bold text-[#2d312e] uppercase tracking-wide block">
                    Registration Number (Reg No) <span className="text-[#ba1a1a]">*</span>
                  </label>
                </div>
                <div className="relative">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#56615a] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS22B029 or 2024CS104"
                    value={signupRegNo}
                    onChange={(e) => setSignupRegNo(e.target.value.toUpperCase())}
                    className="paper-input w-full pl-12 sm:pl-14 pr-4 py-4 text-base sm:text-lg font-mono font-bold rounded-2xl bg-white border-2 border-[#D8D6D4] text-[#1b1c1c] shadow-xs focus:outline-none focus:border-[#56615a]"
                  />
                </div>
                <span className="text-xs text-[#737874] mt-1 block">Roll No or Reg ID assigned by institution</span>
              </div>
            </div>

            {/* 3. Department */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm sm:text-base font-bold text-[#2d312e] uppercase tracking-wide block">
                  Department <span className="text-[#ba1a1a]">*</span>
                </label>
                <span className="text-xs text-[#737874]">Select quick suggestion or type custom</span>
              </div>
              <div className="relative mb-2.5">
                <School className="w-5 h-5 sm:w-6 sm:h-6 text-[#56615a] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Department of Computer Science & Engineering"
                  value={signupDepartment}
                  onChange={(e) => setSignupDepartment(e.target.value)}
                  className="paper-input w-full pl-12 sm:pl-14 pr-4 py-4 text-base sm:text-lg rounded-2xl bg-white border-2 border-[#D8D6D4] text-[#1b1c1c] font-medium shadow-xs focus:outline-none focus:border-[#56615a]"
                />
              </div>
              {/* Department quick chips */}
              <div className="flex flex-wrap gap-1.5">
                {popularDepartments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSignupDepartment(dept)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      signupDepartment === dept
                        ? 'bg-[#56615a] text-white border-[#56615a] font-bold'
                        : 'bg-white text-[#56615a] border-[#D8D6D4] hover:bg-[#F0EDED]'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Institutional Mail ID & 5. Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm sm:text-base font-bold text-[#2d312e] uppercase tracking-wide block">
                    Institutional Mail ID <span className="text-[#ba1a1a]">*</span>
                  </label>
                  {isInstitutionalDomain(signupEmail) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3e5f48] bg-[#d9e6dc] px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Institutional Mail
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#56615a] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@institution.edu"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="paper-input w-full pl-12 sm:pl-14 pr-4 py-4 text-base sm:text-lg rounded-2xl bg-white border-2 border-[#D8D6D4] text-[#1b1c1c] font-medium shadow-xs focus:outline-none focus:border-[#56615a]"
                  />
                </div>
                <span className="text-xs text-[#737874] mt-1 block">Official email address issued by institution</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm sm:text-base font-bold text-[#2d312e] uppercase tracking-wide block">
                    Institutional Mail Password <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <span className="text-xs text-[#56615a] font-bold bg-[#d9e6dc] px-2.5 py-0.5 rounded-full">
                    From Institution
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-[#56615a] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password given for your mail..."
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="paper-input w-full pl-12 sm:pl-14 pr-12 py-4 text-base sm:text-lg rounded-2xl bg-white border-2 border-[#D8D6D4] text-[#1b1c1c] font-medium shadow-xs focus:outline-none focus:border-[#56615a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737874] hover:text-[#1b1c1c] p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <span className="text-xs text-[#56615a] font-medium mt-1 block flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#56615a] flex-shrink-0" />
                  Enter the mail password provided by your institution
                </span>
              </div>
            </div>

            {/* Strict 1-Classroom Assignment Section */}
            <div className="p-5 sm:p-7 bg-[#d9e6dc]/30 border-2 border-[#b2beb5] rounded-3xl space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-6 h-6 text-[#56615a]" />
                <span className="text-base sm:text-lg font-extrabold text-[#1b1c1c] uppercase tracking-wide">
                  Single Classroom Cohort Assignment
                </span>
              </div>
              <p className="text-sm sm:text-base text-[#434844] leading-relaxed">
                In Academic Sanctuary, every student belongs to <strong>one specific classroom cohort</strong> for organized notes, syllabus, announcements, and exam schedules.
              </p>

              <div className="grid grid-cols-3 gap-3 text-center">
                <button
                  type="button"
                  onClick={() => setEnrollmentMode('code')}
                  className={`py-3.5 sm:py-4 px-2 rounded-2xl border-2 text-sm sm:text-base font-bold transition-all cursor-pointer ${
                    enrollmentMode === 'code'
                      ? 'bg-white border-[#56615a] text-[#1b1c1c] shadow-sm ring-2 ring-[#56615a]/20'
                      : 'bg-white/60 border-[#E5E4E2] text-[#737874] hover:bg-white'
                  }`}
                >
                  Enter Code
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollmentMode('select')}
                  className={`py-3.5 sm:py-4 px-2 rounded-2xl border-2 text-sm sm:text-base font-bold transition-all cursor-pointer ${
                    enrollmentMode === 'select'
                      ? 'bg-white border-[#56615a] text-[#1b1c1c] shadow-sm ring-2 ring-[#56615a]/20'
                      : 'bg-white/60 border-[#E5E4E2] text-[#737874] hover:bg-white'
                  }`}
                >
                  Select Cohort
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollmentMode('create')}
                  className={`py-3.5 sm:py-4 px-2 rounded-2xl border-2 text-sm sm:text-base font-bold transition-all cursor-pointer ${
                    enrollmentMode === 'create'
                      ? 'bg-white border-[#56615a] text-[#1b1c1c] shadow-sm ring-2 ring-[#56615a]/20'
                      : 'bg-white/60 border-[#E5E4E2] text-[#737874] hover:bg-white'
                  }`}
                >
                  Create New
                </button>
              </div>

              {enrollmentMode === 'code' && (
                <div className="space-y-2 pt-2">
                  <label className="text-sm sm:text-base font-bold text-[#434844] block">
                    Classroom Access Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ENTER CODE"
                    value={classroomCode}
                    onChange={(e) => setClassroomCode(e.target.value.toUpperCase())}
                    className="paper-input w-full p-4 text-base sm:text-lg font-mono font-extrabold tracking-widest text-[#1b1c1c] uppercase rounded-2xl bg-white border-2 border-[#D8D6D4] shadow-xs"
                  />
                  <span className="text-xs sm:text-sm text-[#737874] block">
                    Enter the unique access code provided by your cohort administrator.
                  </span>
                </div>
              )}

              {enrollmentMode === 'select' && (
                <div className="space-y-2 pt-2">
                  <label className="text-sm sm:text-base font-bold text-[#434844] block">
                    Choose Your Cohort
                  </label>
                  <select
                    value={selectedClassroomId}
                    onChange={(e) => setSelectedClassroomId(e.target.value)}
                    className="w-full p-4 text-base sm:text-lg rounded-2xl bg-white border-2 border-[#D8D6D4] text-[#1b1c1c] font-bold shadow-xs cursor-pointer"
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.collegeName}) • Code: {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {enrollmentMode === 'create' && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-bold text-[#434844] block mb-1">
                        Program / Course
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. B.Tech Computer Science"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        className="paper-input w-full p-3.5 text-sm sm:text-base rounded-2xl bg-white border-2 border-[#D8D6D4]"
                      />
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-bold text-[#434844] block mb-1">
                        University / College
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. University Name"
                        value={newCollegeName}
                        onChange={(e) => setNewCollegeName(e.target.value)}
                        className="paper-input w-full p-3.5 text-sm sm:text-base rounded-2xl bg-white border-2 border-[#D8D6D4]"
                      />
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-[#56642b] font-bold flex items-center gap-1.5 bg-white/80 p-3 rounded-xl border border-[#b2beb5]">
                    <ShieldCheck className="w-4 h-4 text-[#56642b] flex-shrink-0" />
                    <span>You will be registered as the Super Admin for this new cohort.</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4.5 sm:py-5 bg-[#56615a] hover:bg-[#3e4641] disabled:opacity-50 text-white font-extrabold text-base sm:text-xl rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 cursor-pointer"
              >
                <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>{loading ? 'Creating Profile...' : 'Complete Registration & Join Cohort'}</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <p className="text-sm sm:text-base text-[#737874]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-[#56615a] hover:underline cursor-pointer ml-1"
                >
                  Sign In with Institutional Mail & Password →
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

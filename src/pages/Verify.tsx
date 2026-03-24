import React, { useState } from "react";
import { Search, CheckCircle, XCircle, Award, Calendar, User } from "lucide-react";
import { motion } from "motion/react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

interface CertificateDetails {
  certNo: string;
  issueDate: string;
  verified: boolean;
  studentName: string;
  courseName: string;
}

export function Verify() {
  const [studentName, setStudentName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateDetails | null>(null);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !fatherName.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 1. Verify student exists with this name
      const studentQ = query(collection(db, "students"), where("name", "==", studentName.trim()));
      const studentSnap = await getDocs(studentQ);
      
      if (studentSnap.empty) {
        setError("No student found with this Name.");
        setLoading(false);
        return;
      }

      // 2. Find the specific student whose father's name matches
      let matchedStudentData = null;
      for (const doc of studentSnap.docs) {
        const data = doc.data();
        if (data.fatherName && data.fatherName.toLowerCase().trim() === fatherName.toLowerCase().trim()) {
          matchedStudentData = data;
          break;
        }
      }
      
      if (!matchedStudentData) {
        setError("Father's Name does not match our records for this student.");
        setLoading(false);
        return;
      }

      // 3. Find the certificate for this student
      const certQ = query(collection(db, "certificates"), where("studentName", "==", matchedStudentData.name));
      const certSnap = await getDocs(certQ);
      
      if (!certSnap.empty) {
        const certData = certSnap.docs[0].data() as CertificateDetails;
        setResult(certData);
      } else {
        setError("No certificate has been issued for this student yet.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("An error occurred while verifying. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-indigo-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Verify Student & Certificate</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            Enter the Student Name and Father's Name below to verify their details and certificate authenticity.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 flex-grow">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100"
          >
            <form onSubmit={handleVerify} className="flex flex-col gap-4 mb-12">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                  <input 
                    type="text" 
                    placeholder="Enter Student Name" 
                    className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 text-lg transition-all"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>
                <div className="relative flex-grow">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                  <input 
                    type="text" 
                    placeholder="Enter Father's Name" 
                    className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 text-lg transition-all"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading || !studentName.trim() || !fatherName.trim()}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center w-full md:w-auto md:self-end min-w-[160px]"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Verify Now"
                )}
              </button>
            </form>

            {/* Results Area */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl flex items-center gap-4"
              >
                <XCircle size={32} className="text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Verification Failed</h3>
                  <p>{error}</p>
                </div>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 p-8 rounded-2xl"
              >
                <div className="flex items-center gap-4 mb-8 border-b border-green-200 pb-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={36} />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl text-green-800 mb-1">Certificate Verified</h3>
                    <p className="text-green-700 font-medium">This is a valid certificate issued by Maa Kamakhya Computer Institute.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-green-100">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-semibold mb-1">Student Name</p>
                      <p className="font-bold text-gray-900 text-lg">{result.studentName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-green-100">
                      <Award size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-semibold mb-1">Course Completed</p>
                      <p className="font-bold text-gray-900 text-lg">{result.courseName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-green-100">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-semibold mb-1">Issue Date</p>
                      <p className="font-bold text-gray-900 text-lg">
                        {new Date(result.issueDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-green-100">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-semibold mb-1">Certificate Number</p>
                      <p className="font-bold text-gray-900 text-lg font-mono">{result.certNo}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIFB9T3LTgfAnKaxgnVNUgSg9toM6gVKo",
  authDomain: "mkci-final-project.firebaseapp.com",
  projectId: "mkci-final-project",
  storageBucket: "mkci-final-project.firebasestorage.app",
  messagingSenderId: "262704219195",
  appId: "1:262704219195:web:75de2168835e2ec8ed081e",
  measurementId: "G-YT0WEJ2CX1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const defaultContent = {
  instituteInfo: {
    logoUrl: "",
    fullName: "Maa Kamakhya Computer Institute",
    shortName: "Maa Kamakhya",
    tagline: "Computer Institute",
    footerDescription: "Empowering students with industry-relevant computer education and certification at Mungari, Rampur, Prayagraj.",
    footerCourses: ["DCA / ADCA", "Tally Prime", "Web Development", "MS Office", "Programming"],
  },
  heroSection: {
    badgeText: "Trusted Computer Education Center",
    titleLine1: "Build Your Future with",
    titleHighlight: "Computer Skills",
    description: "Maa Kamakhya Computer Institute offers industry-recognized courses in computer applications, programming, accounting & more with certified training and placement support.",
  },
  stats: [
    { value: "94", label: "Students Trained" },
    { value: "5+", label: "Courses Offered" },
    { value: "4+", label: "Years Experience" },
  ],
  about: {
    sectionTitle: "About Us",
    paragraphs: [
      "Maa Kamakhya Computer Institute is a leading computer education institute dedicated to providing quality training in various computer courses. We believe in empowering our students with practical skills that are directly applicable in the professional world.",
      "Our institute offers a wide range of courses from basic computer literacy to advanced programming, ensuring that learners of all levels find the right path to enhance their digital skills."
    ],
    cards: [
      { title: "Mission", description: "To provide affordable, quality computer education to every student seeking to build a career in technology.", icon: "Target" },
      { title: "Vision", description: "To become the most trusted computer education center producing skilled professionals for the IT industry.", icon: "Eye" },
      { title: "Quality", description: "We maintain the highest standards of teaching with regularly updated curriculum and modern infrastructure.", icon: "Award" },
      { title: "Learning", description: "Our hands-on approach ensures students gain practical experience alongside theoretical knowledge.", icon: "BookOpen" }
    ],
  },
  whyChooseUs: {
    sectionTitle: "Why Choose Us",
    subtitle: "We provide world-class computer education with modern infrastructure and expert faculty.",
    highlights: [
      { title: "Modern Labs", description: "State-of-the-art computer labs with latest hardware", icon: "Monitor" },
      { title: "Certified Courses", description: "Industry-recognized certificates on completion", icon: "Award" },
      { title: "Expert Faculty", description: "Experienced trainers with real-world expertise", icon: "Users" },
      { title: "Verified Certificates", description: "Online certificate verification system", icon: "BookOpen" },
      { title: "Flexible Batches", description: "Morning, afternoon & weekend batches available", icon: "ShieldCheck" }
    ],
    checklist: [
      "Industry-recognized certifications",
      "Experienced & qualified faculty",
      "Modern computer labs",
      "Affordable fee structure",
      "Flexible batch timings",
      "Practical-focused training",
      "Online certificate verification"
    ],
  },
  contactInfo: {
    sectionTitle: "Contact Us",
    subtitle: "Get in touch with us for any queries or information.",
    address: "Maa Kamakhya Computer Institute, Mungari,\nRampur, Prayagraj - 212301",
    phone: "+91 7068573528",
    email: "anoopnaini5@gmail.com",
    workingHours: "Mon - Sat: 8:00 AM - 6:00 PM",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114584.73584852928!2d91.7025114!3d26.143254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375a5a287f9133ff%3A0x2bbd1332436bde32!2sGuwahati%2C%20Assam!5e0!3m2!1sen!2sin!4v1709123456789!5m2!1sen!2sin"
  },
  ctaSection: {
    title: "Ready to Start Your Journey?",
    description: "Enroll in our courses today and take the first step towards a successful career in technology."
  },
  testimonials: [
    { name: "Rahul Sharma", role: "Web Development Student", content: "The instructors are very knowledgeable and helpful." },
    { name: "Priya Singh", role: "Data Science Student", content: "I got a job immediately after completing my course." }
  ]
};

async function fill() {
  const docRef = doc(db, "settings", "websiteContent");
  await setDoc(docRef, defaultContent);
  console.log("Filled database with default content!");
  process.exit(0);
}
fill();

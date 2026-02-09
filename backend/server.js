import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const specialties = [
  { id: 1, name: 'Dermatology', icon: 'fa-spa', desc: 'Skin & Hair Care' },
  { id: 2, name: 'Dental', icon: 'fa-tooth', desc: 'Oral Health' },
  { id: 3, name: 'Orthopedics', icon: 'fa-bone', desc: 'Bone & Joint' },
  { id: 4, name: 'Physiotherapy', icon: 'fa-person-running', desc: 'Physical Therapy' },
  { id: 5, name: 'Cardiology', icon: 'fa-heart-pulse', desc: 'Heart Care' },
  { id: 6, name: 'Pediatrics', icon: 'fa-baby', desc: 'Child Health' },
  { id: 7, name: 'Gynecology', icon: 'fa-venus', desc: 'Women Health' },
  { id: 8, name: 'Psychiatry', icon: 'fa-brain', desc: 'Mental Health' }
];

const doctors = [
  {
    id: 1,
    name: 'Dr. Anjali Gupta',
    specialty: 'Dermatologist',
    experience: '12 Years Experience',
    location: 'Koregaon Park, Pune',
    rating: 4.8,
    reviews: 342,
    fee: '₹800',
    avatar: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: 2,
    name: 'Dr. Rajesh Deshmukh',
    specialty: 'Cardiologist',
    experience: '18 Years Experience',
    location: 'Baner, Pune',
    rating: 4.9,
    reviews: 523,
    fee: '₹1200',
    avatar: 'https://i.pravatar.cc/150?img=12'
  },
  {
    id: 3,
    name: 'Dr. Priya Sharma',
    specialty: 'Pediatrician',
    experience: '10 Years Experience',
    location: 'Viman Nagar, Pune',
    rating: 4.7,
    reviews: 289,
    fee: '₹700',
    avatar: 'https://i.pravatar.cc/150?img=9'
  },
  {
    id: 4,
    name: 'Dr. Amit Patel',
    specialty: 'Orthopedic Surgeon',
    experience: '15 Years Experience',
    location: 'Kothrud, Pune',
    rating: 4.9,
    reviews: 456,
    fee: '₹1000',
    avatar: 'https://i.pravatar.cc/150?img=14'
  },
  {
    id: 5,
    name: 'Dr. Sneha Kulkarni',
    specialty: 'Gynecologist',
    experience: '11 Years Experience',
    location: 'Hinjewadi, Pune',
    rating: 4.8,
    reviews: 378,
    fee: '₹900',
    avatar: 'https://i.pravatar.cc/150?img=10'
  },
  {
    id: 6,
    name: 'Dr. Vikram Singh',
    specialty: 'Psychiatrist',
    experience: '14 Years Experience',
    location: 'Camp, Pune',
    rating: 4.6,
    reviews: 234,
    fee: '₹1500',
    avatar: 'https://i.pravatar.cc/150?img=13'
  }
];

const bookings = [];

const getWittyDoctorResponse = (message) => {
  const lower = message.toLowerCase();
  if (/[\u0900-\u097F]/.test(message)) {
    return 'जी, मैं समझता हूं। 😊 क्या आप किसी डॉक्टर से मिलना चाहेंगे? मैं आपके लिए अपॉइंटमेंट बुक कर सकता हूं।';
  }
  if (lower.includes('fever') || lower.includes('temperature')) {
    return '🌡️ I understand you have a fever. This could be due to infection or other causes. I recommend consulting a General Physician. Would you like me to show you available doctors?';
  }
  if (lower.includes('pain') || lower.includes('hurt') || lower.includes('ache')) {
    return "😟 I'm sorry you're in pain. Can you tell me where? Based on location, I can recommend: Head/Back → Orthopedic, Chest → Cardiologist (urgent!), Tooth → Dentist, Abdomen → General Physician.";
  }
  if (lower.includes('skin') || lower.includes('rash') || lower.includes('acne')) {
    return '🧴 For skin concerns, I recommend a Dermatologist. We have excellent skin specialists available. Would you like to book an appointment?';
  }
  if (lower.includes('heart') || lower.includes('chest') || lower.includes('cardiac')) {
    return '⚠️ Heart symptoms need immediate attention! I recommend: 1) Call ambulance if severe pain. 2) Consult Cardiologist urgently. Shall I help you find a cardiologist or call an ambulance?';
  }
  if (lower.includes('appointment') || lower.includes('booking') || lower.includes('book')) {
    return '📅 I can help you book an appointment! Please tell me: which specialty, preferred date/time, and your location in Pune.';
  }
  if (lower.includes('cost') || lower.includes('price') || lower.includes('fee')) {
    return '💰 Consultation fees: General Physician ₹500-800, Specialist ₹800-1500, Senior Consultant ₹1500-2500. Most accept insurance. Would you like to see doctors in a specific price range?';
  }
  if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('ambulance')) {
    return '🚨 For emergencies: click the red Emergency button above or call 108 immediately. I can dispatch an ambulance in 30 seconds. Need help?';
  }
  if (lower.includes('test') || lower.includes('lab') || lower.includes('blood')) {
    return '🧪 We offer home sample collection: blood tests, urine & stool tests, and X-Ray & ECG at home. Free pickup and reports in 24hrs. Shall I help you book?';
  }
  return "I'm Witty Doctor, your AI health assistant! I can help with understanding symptoms, finding specialists, booking appointments, arranging lab tests, and calling ambulances. What can I help you with today?";
};

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const readRequestBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (chunks.length === 0) {
    return null;
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    return null;
  }
};

const getContentType = (filePath) => {
  const ext = path.extname(filePath);
  switch (ext) {
    case '.css':
      return 'text/css';
    case '.js':
      return 'text/javascript';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'text/html';
  }
};

const handleApiRequest = async (req, res, url) => {
  if (req.method === 'GET' && url.pathname === '/api/specialties') {
    return sendJson(res, 200, specialties);
  }

  if (req.method === 'GET' && url.pathname === '/api/doctors') {
    const query = (url.searchParams.get('search') || '').toLowerCase().trim();
    const specialty = (url.searchParams.get('specialty') || '').toLowerCase().trim();

    let results = doctors;
    if (query) {
      results = results.filter((doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.location.toLowerCase().includes(query)
      );
    }
    if (specialty) {
      results = results.filter((doctor) => doctor.specialty.toLowerCase().includes(specialty));
    }

    return sendJson(res, 200, { count: results.length, doctors: results });
  }

  if (req.method === 'POST' && url.pathname === '/api/bookings') {
    const body = await readRequestBody(req);
    const { doctorId, patientName, phone, date, time, reason, whatsapp } = body || {};
    if (!doctorId || !patientName || !phone || !date || !time) {
      return sendJson(res, 400, { message: 'Missing required booking details.' });
    }
    const doctor = doctors.find((item) => item.id === Number(doctorId));
    if (!doctor) {
      return sendJson(res, 404, { message: 'Doctor not found.' });
    }
    const booking = {
      id: bookings.length + 1,
      doctorId: doctor.id,
      doctorName: doctor.name,
      patientName,
      phone,
      date,
      time,
      reason: reason || '',
      whatsapp: Boolean(whatsapp),
      createdAt: new Date().toISOString()
    };
    bookings.push(booking);
    return sendJson(res, 201, { message: 'Booking confirmed.', booking });
  }

  if (req.method === 'POST' && url.pathname === '/api/chat') {
    const body = await readRequestBody(req);
    if (!body?.message) {
      return sendJson(res, 400, { message: 'Message is required.' });
    }
    return sendJson(res, 200, { reply: getWittyDoctorResponse(body.message) });
  }

  if (req.method === 'POST' && url.pathname === '/api/ambulance') {
    const body = await readRequestBody(req);
    return sendJson(res, 200, {
      message: 'Ambulance dispatched! ETA: 8 minutes.',
      trackingId: `AMB-${Date.now()}`,
      location: body?.location || 'Current location'
    });
  }

  return sendJson(res, 404, { message: 'Not found.' });
};

const handleStaticRequest = async (req, res, url) => {
  const publicDir = path.join(__dirname, 'public');
  const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  const resolvedPath = path.join(publicDir, filePath);

  try {
    const data = await fs.readFile(resolvedPath);
    res.writeHead(200, { 'Content-Type': getContentType(resolvedPath) });
    res.end(data);
  } catch (error) {
    const indexPath = path.join(publicDir, 'index.html');
    const data = await fs.readFile(indexPath);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  }
};

const requestListener = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith('/api/')) {
    await handleApiRequest(req, res, url);
    return;
  }
  await handleStaticRequest(req, res, url);
};

const startServer = () => {
  const server = http.createServer(requestListener);
  return server.listen(PORT, () => {
    console.log(`WittyDoctor server running on http://localhost:${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { startServer };

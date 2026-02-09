import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
const { startServer } = await import('../server.js');

const startTestServer = () =>
  new Promise((resolve) => {
    const server = startServer();
    server.on('listening', () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });

test('API endpoints respond with expected data', async () => {
  const { server, port } = await startTestServer();
  const baseUrl = `http://localhost:${port}`;

  try {
    const specialties = await fetch(`${baseUrl}/api/specialties`).then((res) => res.json());
    assert.ok(Array.isArray(specialties));
    assert.ok(specialties.length > 0);

    const doctorsResponse = await fetch(`${baseUrl}/api/doctors?search=dr`).then((res) => res.json());
    assert.ok(doctorsResponse.count >= 1);
    assert.ok(Array.isArray(doctorsResponse.doctors));

    const bookingResponse = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: doctorsResponse.doctors[0].id,
        patientName: 'Test User',
        phone: '9999999999',
        date: '2026-01-10',
        time: '10:00 AM',
        reason: 'Routine check',
        whatsapp: true
      })
    }).then((res) => res.json());
    assert.equal(bookingResponse.message, 'Booking confirmed.');

    const chatResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I have fever' })
    }).then((res) => res.json());
    assert.ok(chatResponse.reply.includes('fever'));
  } finally {
    server.close();
  }
});

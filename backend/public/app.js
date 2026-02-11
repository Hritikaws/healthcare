const state = {
  doctors: [],
  specialties: [],
  selectedDoctor: null,
  selectedTimeSlot: null
};

const timeSlots = [
  { label: '10:00 AM', icon: 'fa-sun' },
  { label: '11:30 AM', icon: 'fa-sun' },
  { label: '02:00 PM', icon: 'fa-cloud-sun' },
  { label: '03:30 PM', icon: 'fa-cloud-sun' },
  { label: '05:00 PM', icon: 'fa-moon' },
  { label: '06:30 PM', icon: 'fa-moon' }
];

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
};

const setMinDate = () => {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('appointmentDate');
  if (dateInput) {
    dateInput.min = today;
  }
};

const showMessage = (text, isSuccess = true) => {
  const messageEl = document.getElementById('successMessage');
  const textEl = document.getElementById('successText');
  textEl.textContent = text;
  messageEl.style.background = isSuccess ? 'var(--secondary)' : 'var(--warning)';
  messageEl.classList.add('active');

  setTimeout(() => {
    messageEl.classList.remove('active');
  }, 5000);
};

const loadSpecialties = async () => {
  const grid = document.getElementById('specialtiesGrid');
  grid.innerHTML = '';
  state.specialties = await fetchJson('/api/specialties');

  state.specialties.forEach((spec) => {
    const card = document.createElement('div');
    card.className = 'specialty-card';
    card.addEventListener('click', () => filterBySpecialty(spec.name));
    card.innerHTML = `
      <div class="specialty-icon">
        <i class="fas ${spec.icon}"></i>
      </div>
      <h4>${spec.name}</h4>
      <p>${spec.desc}</p>
    `;
    grid.appendChild(card);
  });
};

const renderDoctors = (doctors) => {
  const grid = document.getElementById('doctorsGrid');
  grid.innerHTML = '';
  doctors.forEach((doctor) => {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.innerHTML = `
      <div class="doctor-header">
        <img src="${doctor.avatar}" alt="${doctor.name}" class="doctor-avatar" />
        <div class="doctor-info">
          <h3>${doctor.name}</h3>
          <div class="doctor-specialty">
            <i class="fas fa-stethoscope"></i>
            ${doctor.specialty}
          </div>
          <div class="doctor-experience">
            <i class="fas fa-briefcase"></i>
            ${doctor.experience}
          </div>
        </div>
      </div>
      <div class="doctor-details">
        <div class="doctor-detail">
          <i class="fas fa-location-dot"></i>
          <span>${doctor.location}</span>
        </div>
        <div class="doctor-detail">
          <i class="fas fa-star"></i>
          <span>${doctor.rating} (${doctor.reviews} reviews)</span>
        </div>
        <div class="doctor-detail">
          <i class="fas fa-indian-rupee-sign"></i>
          <span>${doctor.fee} Consultation</span>
        </div>
      </div>
      <div class="doctor-actions">
        <button class="btn btn-primary" data-book="${doctor.id}">
          <i class="fas fa-calendar-check"></i>
          Book Now
        </button>
        <button class="btn btn-outline" data-profile="${doctor.id}">
          <i class="fas fa-user"></i>
          Profile
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('[data-book]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.book);
      const doctor = state.doctors.find((item) => item.id === id);
      if (doctor) {
        bookAppointment(doctor);
      }
    });
  });

  grid.querySelectorAll('[data-profile]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.profile);
      showDoctorProfile(id);
    });
  });
};

const loadDoctors = async (query = '') => {
  const data = await fetchJson(`/api/doctors?search=${encodeURIComponent(query)}`);
  state.doctors = data.doctors;
  document.getElementById('doctorCount').textContent = `${data.count}+`;
  renderDoctors(state.doctors);
};

const searchDoctors = async () => {
  const input = document.getElementById('searchInput');
  const query = input.value.toLowerCase().trim();
  if (!query) {
    showMessage('⚠️ Please enter a search term', false);
    return;
  }

  const data = await fetchJson(`/api/doctors?search=${encodeURIComponent(query)}`);
  state.doctors = data.doctors;
  renderDoctors(state.doctors);

  if (data.count > 0) {
    showMessage(`🔍 Found ${data.count} doctor(s) matching "${query}"`, true);
    document.getElementById('doctors').scrollIntoView({ behavior: 'smooth' });
  } else {
    showMessage('❌ No doctors found. Try another search term.', false);
  }
};

const filterBySpecialty = async (specialty) => {
  const data = await fetchJson(`/api/doctors?specialty=${encodeURIComponent(specialty)}`);
  state.doctors = data.doctors;
  renderDoctors(state.doctors);
  showMessage(`🏥 Showing ${specialty} specialists`, true);
  document.getElementById('doctors').scrollIntoView({ behavior: 'smooth' });
};

const bookAppointment = (doctor) => {
  state.selectedDoctor = doctor;
  document.getElementById('doctorInfo').style.display = 'block';
  document.getElementById('modalDoctorAvatar').src = doctor.avatar;
  document.getElementById('modalDoctorName').textContent = doctor.name;
  document.getElementById('modalDoctorSpecialty').textContent = doctor.specialty;
  document.getElementById('modalDoctorFee').textContent = `Consultation: ${doctor.fee}`;
  openModal('bookingModal');
};

const submitBooking = async (event) => {
  event.preventDefault();
  if (!state.selectedTimeSlot) {
    showMessage('⚠️ Please select a time slot', false);
    return;
  }

  const form = event.target;
  const formData = new FormData(form);
  const payload = {
    doctorId: state.selectedDoctor?.id,
    patientName: formData.get('patientName'),
    phone: formData.get('phone'),
    date: formData.get('date'),
    time: state.selectedTimeSlot,
    reason: formData.get('reason'),
    whatsapp: document.getElementById('whatsappNotif').checked
  };

  try {
    await fetchJson('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    closeModal('bookingModal');
    showMessage(`🎉 Appointment booked with ${state.selectedDoctor.name} on ${payload.date} at ${payload.time}! Confirmation sent.`, true);
    form.reset();
    document.querySelectorAll('.time-slot').forEach((slot) => slot.classList.remove('selected'));
    state.selectedTimeSlot = null;
  } catch (error) {
    showMessage(`❌ ${error.message}`, false);
  }
};

const selectTimeSlot = (element) => {
  document.querySelectorAll('.time-slot').forEach((slot) => {
    slot.classList.remove('selected');
  });
  element.classList.add('selected');
  state.selectedTimeSlot = element.dataset.time;
};

const buildTimeSlots = () => {
  const container = document.getElementById('timeSlots');
  container.innerHTML = '';
  timeSlots.forEach((slot) => {
    const div = document.createElement('div');
    div.className = 'time-slot';
    div.dataset.time = slot.label;
    div.innerHTML = `<i class="fas ${slot.icon}"></i>${slot.label}`;
    div.addEventListener('click', () => selectTimeSlot(div));
    container.appendChild(div);
  });
};

const bookAmbulance = async () => {
  if (!confirm('🚨 EMERGENCY ALERT\n\nDo you need an ambulance at your current location?\n\nClick OK to dispatch immediately.')) {
    return;
  }
  try {
    const response = await fetchJson('/api/ambulance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: 'Pune, Maharashtra' })
    });
    showMessage(`🚑 ${response.message} Tracking: ${response.trackingId}`, true);
  } catch (error) {
    showMessage(`❌ ${error.message}`, false);
  }
};

const showDoctorProfile = (doctorId) => {
  const doctor = state.doctors.find((item) => item.id === doctorId);
  if (doctor) {
    showMessage(`👨‍⚕️ Viewing profile of ${doctor.name}`, true);
  }
};

const toggleChat = () => {
  const chatWindow = document.getElementById('chatWindow');
  chatWindow.classList.toggle('active');
  if (chatWindow.classList.contains('active')) {
    document.getElementById('chatInput').focus();
  }
};

const openAIChat = () => {
  document.getElementById('chatWindow').classList.add('active');
  document.getElementById('chatInput').focus();
};

const addMessage = (text, isUser) => {
  const messagesContainer = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : ''}`;
  messageDiv.innerHTML = `
    <div class="message-avatar">
      <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
    </div>
    <div class="message-content">${text}</div>
  `;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

const sendMessage = async () => {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, true);
  input.value = '';

  const typingIndicator = document.getElementById('typingIndicator');
  typingIndicator.classList.add('active');

  try {
    const response = await fetchJson('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    addMessage(response.reply, false);
  } catch (error) {
    addMessage('Sorry, something went wrong. Please try again.', false);
  } finally {
    typingIndicator.classList.remove('active');
  }
};

const handleChatEnter = (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
};

const openModal = (modalId) => {
  document.getElementById(modalId).classList.add('active');
  document.body.style.overflow = 'hidden';
};

const closeModal = (modalId) => {
  document.getElementById(modalId).classList.remove('active');
  document.body.style.overflow = 'auto';
};


const closeAllDropdowns = () => {
  document.querySelectorAll('.nav-item.open').forEach((item) => {
    item.classList.remove('open');
    const toggle = item.querySelector('.nav-dropdown-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
};

const openDropdown = (item) => {
  closeAllDropdowns();
  item.classList.add('open');
  const toggle = item.querySelector('.nav-dropdown-toggle');
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'true');
  }
};

const initNavigation = () => {
  const mobileToggle = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.getElementById('mobileMenu');

  const navContainer = document.querySelector('.nav-container');

  document.querySelectorAll('.nav-item.has-dropdown').forEach((item) => {
    const toggle = item.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;

    item.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) {
        openDropdown(item);
      }
    });

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      const isOpen = item.classList.contains('open');
      if (isOpen) {
        closeAllDropdowns();
      } else {
        openDropdown(item);
      }
    });

    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeAllDropdowns();
        toggle.focus();
      }
    });
  });


  navContainer?.addEventListener('mouseleave', () => {
    if (window.innerWidth > 768) {
      closeAllDropdowns();
    }
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-menu')) {
      closeAllDropdowns();
    }
  });

  document.querySelectorAll('[data-nav-close]').forEach((link) => {
    link.addEventListener('click', () => {
      closeAllDropdowns();
    });
  });

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isActive = mobileMenu.classList.toggle('active');
      mobileMenu.hidden = !isActive;
      mobileToggle.setAttribute('aria-expanded', String(isActive));
      mobileToggle.innerHTML = isActive
        ? '<i class="fas fa-times"></i>'
        : '<i class="fas fa-bars"></i>';
    });
  }

  document.querySelectorAll('.mobile-link[data-mobile-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.mobileTarget;
      const section = target ? document.querySelector(target) : null;
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
      if (mobileMenu?.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        mobileMenu.hidden = true;
        mobileToggle?.setAttribute('aria-expanded', 'false');
        if (mobileToggle) {
          mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
      }
    });
  });

  const chatOpenButtons = [
    document.getElementById('navChatOpen'),
    document.getElementById('mobileChatOpen')
  ].filter(Boolean);

  chatOpenButtons.forEach((button) => {
    button.addEventListener('click', () => {
      openAIChat();
      closeAllDropdowns();
      if (mobileMenu?.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        mobileMenu.hidden = true;
        mobileToggle?.setAttribute('aria-expanded', 'false');
        if (mobileToggle) {
          mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
      }
    });
  });
};

const initEventListeners = () => {
  document.getElementById('searchButton').addEventListener('click', searchDoctors);
  document.getElementById('logoButton').addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.getElementById('emergencyNav').addEventListener('click', bookAmbulance);
  document.getElementById('emergencyMobile')?.addEventListener('click', bookAmbulance);
  document.getElementById('ambulanceButton').addEventListener('click', bookAmbulance);
  document.getElementById('labTestButton').addEventListener('click', () => {
    showMessage('Lab test booking feature coming soon! 🧪');
  });
  document.getElementById('medicineButton').addEventListener('click', () => {
    showMessage('Medicine delivery coming soon! 💊');
  });
  document.getElementById('featureChat').addEventListener('click', openAIChat);
  document.getElementById('footerChat').addEventListener('click', (event) => {
    event.preventDefault();
    openAIChat();
  });
  document.getElementById('chatButton').addEventListener('click', toggleChat);
  document.getElementById('closeChat').addEventListener('click', toggleChat);
  document.getElementById('sendButton').addEventListener('click', sendMessage);
  document.getElementById('chatInput').addEventListener('keypress', handleChatEnter);
  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => closeModal(button.dataset.close));
  });
  document.getElementById('bookingForm').addEventListener('submit', submitBooking);

  document.querySelectorAll('.quick-action').forEach((button) => {
    button.addEventListener('click', () => {
      const message = button.dataset.message;
      document.getElementById('chatInput').value = message;
      sendMessage();
    });
  });
};

const initScrollEffects = () => {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
};

const initApp = async () => {
  setMinDate();
  buildTimeSlots();
  initEventListeners();
  initNavigation();
  initScrollEffects();
  await loadSpecialties();
  await loadDoctors();
};

window.addEventListener('DOMContentLoaded', () => {
  initApp().catch(() => {
    showMessage('❌ Unable to load data. Please refresh the page.', false);
  });
});

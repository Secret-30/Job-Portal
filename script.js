let users = JSON.parse(localStorage.getItem('users')) || [];
let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
let applications = JSON.parse(localStorage.getItem('applications')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let selectedJobId = null;

// Dummy Data with All Categories
if (jobs.length === 0) {
  jobs = [
    { id: 1, title: "Frontend Developer", company: "Tech Corp", category: "Frontend", skills: ["React", "JavaScript", "CSS", "HTML"], desc: "Build amazing UIs with React. 2+ years experience needed.", status: "Active", employerEmail: "hr@tech.com" },
    { id: 2, title: "Backend Developer", company: "Data Systems", category: "Backend", skills: ["Node.js", "MongoDB", "Express", "API"], desc: "Build scalable APIs and microservices.", status: "Active", employerEmail: "hr@data.com" },
    { id: 3, title: "Full Stack Developer", company: "Startup Inc", category: "Fullstack", skills: ["React", "Node.js", "MongoDB"], desc: "Work on entire product stack.", status: "Active", employerEmail: "hr@startup.com" },
    { id: 4, title: "QA Engineer", company: "Quality First", category: "Testing", skills: ["Selenium", "Manual Testing", "JIRA"], desc: "Ensure product quality through testing.", status: "Active", employerEmail: "hr@quality.com" },
    { id: 5, title: "UI/UX Designer", company: "Design Co", category: "Design", skills: ["Figma", "Adobe XD", "Sketch"], desc: "Create beautiful user experiences.", status: "Active", employerEmail: "hr@design.com" },
    { id: 6, title: "Digital Marketing Executive", company: "Growth Ltd", category: "Marketing", skills: ["SEO", "Google Ads", "Social Media"], desc: "Lead marketing campaigns.", status: "Active", employerEmail: "hr@growth.com" },
    { id: 7, title: "Backend Engineer", company: "Cloud Tech", category: "Backend", skills: ["Python", "Django", "PostgreSQL"], desc: "Python backend development.", status: "Active", employerEmail: "hr@cloud.com" },
    { id: 8, title: "Test Automation Engineer", company: "AutoTest Pro", category: "Testing", skills: ["Cypress", "Jest", "API Testing"], desc: "Automate test cases for web apps.", status: "Active", employerEmail: "hr@autotest.com" }
  ];
  localStorage.setItem('jobs', JSON.stringify(jobs));
}

// DOM Elements
const pages = document.querySelectorAll('.page');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

function showPage(pageId) {
  pages.forEach(p => p.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');
}

// Navigation
document.getElementById('homeBtn').onclick = () => showPage('homeSection');
document.getElementById('jobsBtn').onclick = () => { showPage('jobsSection'); renderAllJobs(); };
document.getElementById('aboutBtn').onclick = () => showPage('aboutSection');
document.getElementById('contactBtn').onclick = () => showPage('contactSection');
document.getElementById('profileBtn').onclick = () => { showPage('profileSection'); renderProfile(); };
document.getElementById('browseJobsBtn').onclick = () => { showPage('jobsSection'); renderAllJobs(); };
document.getElementById('dashboardBtn').onclick = () => { showPage('dashboardSection'); renderDashboard(); };

// Auth Tabs - THIS FIXES SIGNUP OPTION
document.querySelectorAll('.tab').forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    if (tab.dataset.tab === 'login') {
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
    } else {
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    }
  };
});

// Signup - NOW WORKING
signupForm.onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const role = document.getElementById('signupRole').value;
  
  if (users.find(u => u.email === email)) {
    alert('Email already exists');
    return;
  }
  
  users.push({ name, email, password, role, skills: [] });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Signup successful! Please login.');
  document.querySelector('.tab[data-tab="login"]').click();
  signupForm.reset();
};

// Login
loginForm.onsubmit = (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateNav();
    showPage('homeSection');
    renderFeaturedJobs();
    loginForm.reset();
  } else {
    alert('Invalid credentials');
  }
};

// Logout
document.getElementById('authBtn').onclick = () => {
  if (currentUser) {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateNav();
    showPage('authSection');
  } else {
    showPage('authSection');
  }
};

function updateNav() {
  const authBtn = document.getElementById('authBtn');
  if (currentUser) {
    authBtn.textContent = 'Logout';
    document.getElementById('dashboardBtn').classList.remove('hidden');
    document.getElementById('profileBtn').classList.remove('hidden');
    document.getElementById('welcomeUser').textContent = `Hi, ${currentUser.name}`;
  } else {
    authBtn.textContent = 'Login';
    document.getElementById('dashboardBtn').classList.add('hidden');
    document.getElementById('profileBtn').classList.add('hidden');
    document.getElementById('welcomeUser').textContent = '';
  }
}

// Skills Management - FIXED
function renderProfile() {
  document.getElementById('profileInfo').innerHTML = `
    <p><strong>Name:</strong> ${currentUser.name}</p>
    <p><strong>Email:</strong> ${currentUser.email}</p>
    <p><strong>Role:</strong> ${currentUser.role}</p>
  `;
  renderSkills();
}

function renderSkills() {
  const user = users.find(u => u.email === currentUser.email);
  const skillsHtml = user.skills.length 
 ? user.skills.map(skill => `<span class="skill-tag">${skill}<span onclick="removeSkill('${skill}')" style="cursor:pointer;margin-left:5px;font-weight:bold">×</span></span>`).join('')
    : '<p style="opacity:0.7">No skills added yet. Add skills to apply for jobs.</p>';
  document.getElementById('skillsList').innerHTML = skillsHtml;
}

document.getElementById('addSkillBtn').onclick = () => {
  const skillInput = document.getElementById('skillInput');
  const skill = skillInput.value.trim();
  if (!skill) return;
  
  const userIndex = users.findIndex(u => u.email === currentUser.email);
  
  // Check case-insensitive to avoid React/react duplicates
  const skillExists = users[userIndex].skills.some(s => s.toLowerCase() === skill.toLowerCase());
  
  if (!skillExists) {
    users[userIndex].skills.push(skill);
    currentUser = users[userIndex]; // Sync currentUser with updated user
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    skillInput.value = '';
    renderSkills();
  } else {
    alert('Skill already added');
    skillInput.value = '';
  }
};
window.removeSkill = (skill) => {
  const userIndex = users.findIndex(u => u.email === currentUser.email);
  users[userIndex].skills = users[userIndex].skills.filter(s => s!== skill);
  currentUser = users[userIndex]; // Sync again
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  renderSkills();
};

// Render Jobs - CLICK NOW WORKS
function createJobCard(job) {
  const skillsHtml = job.skills? job.skills.map(s => `<span class="skill-tag">${s}</span>`).join('') : '';
  return `
    <div class="job-card" onclick="openJobModal(${job.id})">
      <h3>${job.title}</h3>
      <p class="company">${job.company}</p>
      <span class="category">${job.category}</span>
      <div style="margin-top:0.8rem">${skillsHtml}</div>
    </div>
  `;
}

function renderFeaturedJobs() {
  document.getElementById('featuredJobsList').innerHTML = jobs.slice(0, 3).map(createJobCard).join('');
}

function renderAllJobs() {
  const search = document.getElementById('searchJob').value.toLowerCase();
  const category = document.getElementById('filterCategory').value;
  let filtered = jobs.filter(j => j.status === 'Active');
  if (search) filtered = filtered.filter(j => j.title.toLowerCase().includes(search));
  if (category) filtered = filtered.filter(j => j.category === category);
  document.getElementById('allJobsList').innerHTML = filtered.map(createJobCard).join('');
}

document.getElementById('searchJob').oninput = renderAllJobs;
document.getElementById('filterCategory').onchange = renderAllJobs;

// Job Modal with Skill Check - APPLY NOW WORKS
window.openJobModal = (id) => {
  selectedJobId = id;
  const job = jobs.find(j => j.id === id);
  const skillsHtml = job.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
  
  document.getElementById('jobDetails').innerHTML = `
    <h2>${job.title}</h2>
    <p><strong>Company:</strong> ${job.company}</p>
    <p><strong>Category:</strong> ${job.category}</p>
    <p><strong>Required Skills:</strong></p>
    <div>${skillsHtml}</div>
    <p style="margin-top:1rem"><strong>Description:</strong><br>${job.desc}</p>
  `;
  
  const applyBtn = document.getElementById('applyJobBtn');
  const skillMatchInfo = document.getElementById('skillMatchInfo');
  
  if (!currentUser) {
    applyBtn.textContent = 'Login to Apply';
    applyBtn.disabled = false;
    applyBtn.style.display = 'block';
    applyBtn.onclick = () => {
      document.getElementById('jobModal').classList.add('hidden');
      showPage('authSection');
    };
    skillMatchInfo.innerHTML = '';
  } else if (currentUser.role!== 'Candidate') {
    applyBtn.style.display = 'none';
    skillMatchInfo.innerHTML = '';
  } else {
    applyBtn.style.display = 'block';
    const alreadyApplied = applications.some(a => a.jobId === id && a.userEmail === currentUser.email);
    if (alreadyApplied) {
      applyBtn.textContent = 'Already Applied';
      applyBtn.disabled = true;
      skillMatchInfo.innerHTML = '';
    } else {
      const userSkills = currentUser.skills || [];
      const requiredSkills = job.skills || [];
      const hasAllSkills = requiredSkills.every(skill => 
        userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
      );
      
      if (hasAllSkills) {
        applyBtn.textContent = 'Apply Now';
        applyBtn.disabled = false;
        applyBtn.onclick = applyForJob;
        skillMatchInfo.innerHTML = '<div class="match-success">✓ You have all required skills!</div>';
      } else {
        const missingSkills = requiredSkills.filter(skill => 
       !userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
        );
        applyBtn.textContent = 'Skills Not Matched';
        applyBtn.disabled = true;
        skillMatchInfo.innerHTML = `<div class="match-fail">✗ Missing skills: ${missingSkills.join(', ')}. Add them in Profile.</div>`;
      }
    }
  }
  
  document.getElementById('jobModal').classList.remove('hidden');
};

function applyForJob() {
  applications.push({ jobId: selectedJobId, userEmail: currentUser.email, userName: currentUser.name });
  localStorage.setItem('applications', JSON.stringify(applications));
  alert('Applied successfully!');
  document.getElementById('jobModal').classList.add('hidden');
}

// Close Modals
document.querySelectorAll('.close').forEach(btn => {
  btn.onclick = () => btn.closest('.modal').classList.add('hidden');
});

// Contact Form
document.getElementById('contactForm').onsubmit = (e) => {
  e.preventDefault();
  alert('Message sent! We will contact you soon.');
  e.target.reset();
};

// Dashboard
function renderDashboard() {
  document.getElementById('dashboardTitle').textContent = `${currentUser.role} Dashboard`;
  if (currentUser.role === 'Candidate') {
    document.getElementById('candidateDash').classList.remove('hidden');
    document.getElementById('employerDash').classList.add('hidden');
    renderAppliedJobs();
  } else {
    document.getElementById('employerDash').classList.remove('hidden');
    document.getElementById('candidateDash').classList.add('hidden');
    renderEmployerJobs();
  }
}

function renderAppliedJobs() {
  const applied = applications.filter(a => a.userEmail === currentUser.email);
  const appliedJobs = applied.map(a => jobs.find(j => j.id === a.jobId)).filter(Boolean);
  document.getElementById('appliedJobsList').innerHTML = appliedJobs.length 
 ? appliedJobs.map(createJobCard).join('') 
    : '<p>No jobs applied yet.</p>';
}

// Employer Functions
document.getElementById('addJobBtn').onclick = () => {
  document.getElementById('jobFormTitle').textContent = 'Add New Job';
  document.getElementById('jobForm').reset();
  document.getElementById('jobId').value = '';
  document.getElementById('addJobModal').classList.remove('hidden');
};

document.getElementById('jobForm').onsubmit = (e) => {
  e.preventDefault();
  const id = document.getElementById('jobId').value;
  const skillsInput = document.getElementById('jobSkills').value;
  const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(s => s);
  
  const jobData = {
    title: document.getElementById('jobTitle').value,
    company: document.getElementById('companyName').value,
    category: document.getElementById('jobCategory').value,
    skills: skillsArray,
    desc: document.getElementById('jobDesc').value,
    status: document.getElementById('jobStatus').value,
    employerEmail: currentUser.email
  };
  
  if (id) {
    const index = jobs.findIndex(j => j.id == id);
    jobs[index] = {...jobs[index],...jobData};
  } else {
    jobData.id = Date.now();
    jobs.push(jobData);
  }
  
  localStorage.setItem('jobs', JSON.stringify(jobs));
  document.getElementById('addJobModal').classList.add('hidden');
  renderEmployerJobs();
  renderAllJobs();
};

function renderEmployerJobs() {
  const myJobs = jobs.filter(j => j.employerEmail === currentUser.email);
  document.getElementById('employerJobsList').innerHTML = myJobs.map(job => `
    <div class="employer-job">
      <div>
        <h4>${job.title}</h4>
        <p>${job.company} - ${job.status}</p>
        <div>${job.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
      </div>
      <div class="job-actions">
        <button class="view-btn" onclick="viewApplicants(${job.id})">View Applicants</button>
        <button class="edit-btn" onclick="editJob(${job.id})">Edit</button>
        <button class="delete-btn" onclick="deleteJob(${job.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

window.editJob = (id) => {
  const job = jobs.find(j => j.id === id);
  document.getElementById('jobFormTitle').textContent = 'Edit Job';
  document.getElementById('jobId').value = job.id;
  document.getElementById('jobTitle').value = job.title;
  document.getElementById('companyName').value = job.company;
  document.getElementById('jobCategory').value = job.category;
  document.getElementById('jobSkills').value = job.skills.join(', ');
  document.getElementById('jobDesc').value = job.desc;
  document.getElementById('jobStatus').value = job.status;
  document.getElementById('addJobModal').classList.remove('hidden');
};

window.deleteJob = (id) => {
  if (confirm('Delete this job?')) {
    jobs = jobs.filter(j => j.id!== id);
    applications = applications.filter(a => a.jobId!== id);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    localStorage.setItem('applications', JSON.stringify(applications));
    renderEmployerJobs();
    renderAllJobs();
  }
};

window.viewApplicants = (jobId) => {
  const jobApplicants = applications.filter(a => a.jobId === jobId);
  document.getElementById('applicantsList').innerHTML = jobApplicants.length
 ? jobApplicants.map(a => `<p><strong>${a.userName}</strong> - ${a.userEmail}</p>`).join('')
    : '<p>No applicants yet.</p>';
  document.getElementById('applicantsModal').classList.remove('hidden');
};

// Init
updateNav();
if (currentUser) {
  showPage('homeSection');
  renderFeaturedJobs();
} else {
  showPage('authSection');
}
renderFeaturedJobs();
document.getElementById('resetBtn').addEventListener('click', () => {
  localStorage.clear(); 
  alert('Data cleared! Now refresh the page'); 
  location.reload();
});

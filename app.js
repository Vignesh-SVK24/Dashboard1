// ===== ProFolio - Student Portfolio Dashboard =====
// All data is persisted in localStorage

// ===== UTILITY FUNCTIONS =====

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || icons.info}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getUsers() {
    return JSON.parse(localStorage.getItem('profolio_users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('profolio_users', JSON.stringify(users));
}

function getCurrentUser() {
    const name = sessionStorage.getItem('profolio_current');
    if (!name) return null;
    const users = getUsers();
    return users.find(u => u.name === name) || null;
}

function saveCurrentUser(userData) {
    const users = getUsers();
    const idx = users.findIndex(u => u.name === userData.name);
    if (idx !== -1) {
        users[idx] = userData;
    } else {
        users.push(userData);
    }
    saveUsers(users);
}


// ===== AUTH FUNCTIONS (index.html) =====

function switchAuthTab(tab) {
    const registerTab = document.getElementById('registerTab');
    const loginTab = document.getElementById('loginTab');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    if (!registerTab) return;

    if (tab === 'register') {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    } else {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const designation = document.getElementById('regDesignation').value.trim();
    const role = document.getElementById('regRole').value;
    const password = document.getElementById('regPassword').value;

    if (!name || !designation || !role || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Creator role is restricted to Vignesh only
    if (role === 'Creator' && name.toLowerCase() !== 'vignesh') {
        showToast('Creator role is reserved for Vignesh only!', 'error');
        return;
    }

    // Check if Creator already exists
    const users = getUsers();
    if (role === 'Creator' && users.find(u => u.role === 'Creator')) {
        showToast('A Creator account already exists!', 'error');
        return;
    }

    if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
        showToast('An account with this name already exists. Please sign in.', 'error');
        return;
    }

    const newUser = {
        name,
        designation,
        role,
        password,
        avatar: '',
        email: '',
        phone: '',
        dob: '',
        address: '',
        bio: '',
        location: '',
        education: [],
        skills: [],
        hobbies: [],
        projects: []
    };

    users.push(newUser);
    saveUsers(users);
    sessionStorage.setItem('profolio_current', name);
    showToast('Account created successfully!', 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 500);
}

function handleLogin(e) {
    e.preventDefault();
    const name = document.getElementById('loginName').value.trim();
    const password = document.getElementById('loginPassword').value;

    const users = getUsers();
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());

    if (!user) {
        showToast('No account found with this name', 'error');
        return;
    }

    if (user.password !== password) {
        showToast('Incorrect password', 'error');
        return;
    }

    sessionStorage.setItem('profolio_current', user.name);
    showToast('Welcome back!', 'success');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 500);
}


// ===== DASHBOARD FUNCTIONS =====

function initDashboard() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    updateSidebar(user);
    loadProfile(user);
    renderEducation(user);
    renderSkills(user);
    renderHobbies(user);
    renderProjects(user);
}

function updateSidebar(user) {
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const sidebarName = document.getElementById('sidebarName');
    const sidebarDesignation = document.getElementById('sidebarDesignation');
    const sidebarRoleBadge = document.getElementById('sidebarRoleBadge');

    if (!sidebarAvatar) return;

    sidebarName.textContent = user.name;
    sidebarDesignation.textContent = user.designation;

    // Update role badge
    if (sidebarRoleBadge) {
        sidebarRoleBadge.textContent = user.role || 'Student';
        sidebarRoleBadge.className = 'role-badge role-' + (user.role || 'Student').toLowerCase();
    }

    if (user.avatar) {
        sidebarAvatar.innerHTML = `<img src="${user.avatar}" alt="Avatar">`;
    } else {
        sidebarAvatar.textContent = user.name.charAt(0).toUpperCase();
    }
}

function loadProfile(user) {
    const profileName = document.getElementById('profileName');
    if (!profileName) return;

    profileName.value = user.name;
    document.getElementById('profileDesignation').value = user.designation;
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profilePhone').value = user.phone || '';
    document.getElementById('profileDob').value = user.dob || '';
    document.getElementById('profileAddress').value = user.address || '';
    document.getElementById('profileBio').value = user.bio || '';
    document.getElementById('profileLocation').value = user.location || '';

    document.getElementById('profileDisplayName').textContent = user.name;
    document.getElementById('profileDisplayDesignation').textContent = user.designation;

    // Update role badge
    const profileRoleBadge = document.getElementById('profileRoleBadge');
    if (profileRoleBadge) {
        profileRoleBadge.textContent = user.role || 'Student';
        profileRoleBadge.className = 'role-badge role-' + (user.role || 'Student').toLowerCase();
    }

    const avatarEl = document.getElementById('profileAvatar');
    const initialEl = document.getElementById('profileAvatarInitial');
    if (user.avatar) {
        initialEl.style.display = 'none';
        // Remove existing img if any
        const existingImg = avatarEl.querySelector('img');
        if (existingImg) existingImg.remove();
        const img = document.createElement('img');
        img.src = user.avatar;
        img.alt = 'Avatar';
        avatarEl.insertBefore(img, avatarEl.firstChild);
    } else {
        initialEl.style.display = '';
        initialEl.textContent = user.name.charAt(0).toUpperCase();
    }
}

function saveProfile(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;

    const oldName = user.name;
    user.name = document.getElementById('profileName').value.trim() || user.name;
    user.designation = document.getElementById('profileDesignation').value.trim() || user.designation;
    user.email = document.getElementById('profileEmail').value.trim();
    user.phone = document.getElementById('profilePhone').value.trim();
    user.dob = document.getElementById('profileDob').value;
    user.address = document.getElementById('profileAddress').value.trim();
    user.bio = document.getElementById('profileBio').value.trim();
    user.location = document.getElementById('profileLocation').value.trim();

    // If name changed, update the session key
    if (oldName !== user.name) {
        const users = getUsers();
        const idx = users.findIndex(u => u.name === oldName);
        if (idx !== -1) { users.splice(idx, 1); }
        users.push(user);
        saveUsers(users);
        sessionStorage.setItem('profolio_current', user.name);
    } else {
        saveCurrentUser(user);
    }

    updateSidebar(user);
    loadProfile(user);
    showToast('Profile updated successfully!', 'success');
}

function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (ev) {
        const user = getCurrentUser();
        if (!user) return;
        user.avatar = ev.target.result;
        saveCurrentUser(user);
        updateSidebar(user);
        loadProfile(user);
        showToast('Profile photo updated!', 'success');
    };
    reader.readAsDataURL(file);
}


// ===== SECTION SWITCHING =====

function switchSection(sectionName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionName);
    });

    // Update sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.toggle('active', section.id === `section-${sectionName}`);
    });

    // Close mobile sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}


// ===== MODAL FUNCTIONS =====

function openModal(type) {
    const modal = document.getElementById(`modal-${type}`);
    if (modal) {
        modal.classList.add('active');
        // Reset form
        const form = modal.querySelector('form');
        if (form) form.reset();
        // Reset edit index
        const editInput = modal.querySelector('input[type="hidden"]');
        if (editInput) editInput.value = '-1';
        // Reset modal title
        const titleEl = document.getElementById(`${type}ModalTitle`);
        if (titleEl) titleEl.textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        // Reset project image preview
        if (type === 'project') {
            currentProjectImage = '';
            const upload = document.getElementById('projectImageUpload');
            const existingImg = upload.querySelector('img');
            if (existingImg) existingImg.remove();
        }
        // Reset skill level display
        if (type === 'skill') {
            document.getElementById('skillLevelValue').textContent = '50';
            document.getElementById('skillLevel').value = 50;
        }
    }
}

function closeModal(type) {
    const modal = document.getElementById(`modal-${type}`);
    if (modal) modal.classList.remove('active');
}

// Close modal on overlay click
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});


// ===== EDUCATION CRUD =====

function renderEducation(user) {
    const container = document.getElementById('educationList');
    if (!container) return;

    if (!user.education || user.education.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎓</div>
        <h4>No education added yet</h4>
        <p>Click "Add Education" to add your qualifications</p>
      </div>`;
        return;
    }

    container.innerHTML = user.education.map((edu, i) => `
    <div class="item-card">
      <div class="item-icon edu">🎓</div>
      <div class="item-content">
        <h4>${edu.degree}</h4>
        <p>${edu.institution}</p>
        <p>${edu.startYear} – ${edu.endYear}${edu.grade ? ' • ' + edu.grade : ''}</p>
      </div>
      <div class="item-actions">
        <button class="btn-icon" onclick="editEducation(${i})" title="Edit">✏️</button>
        <button class="btn-icon delete" onclick="deleteEducation(${i})" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');
}

function saveEducation(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;

    const idx = parseInt(document.getElementById('eduEditIndex').value);
    const entry = {
        institution: document.getElementById('eduInstitution').value.trim(),
        degree: document.getElementById('eduDegree').value.trim(),
        startYear: document.getElementById('eduStartYear').value.trim(),
        endYear: document.getElementById('eduEndYear').value.trim(),
        grade: document.getElementById('eduGrade').value.trim()
    };

    if (!user.education) user.education = [];

    if (idx >= 0) {
        user.education[idx] = entry;
        showToast('Education updated!', 'success');
    } else {
        user.education.push(entry);
        showToast('Education added!', 'success');
    }

    saveCurrentUser(user);
    renderEducation(user);
    closeModal('education');
}

function editEducation(index) {
    const user = getCurrentUser();
    if (!user || !user.education[index]) return;
    const edu = user.education[index];

    document.getElementById('eduEditIndex').value = index;
    document.getElementById('eduInstitution').value = edu.institution;
    document.getElementById('eduDegree').value = edu.degree;
    document.getElementById('eduStartYear').value = edu.startYear;
    document.getElementById('eduEndYear').value = edu.endYear;
    document.getElementById('eduGrade').value = edu.grade || '';
    document.getElementById('educationModalTitle').textContent = 'Edit Education';

    document.getElementById('modal-education').classList.add('active');
}

function deleteEducation(index) {
    if (!confirm('Remove this education entry?')) return;
    const user = getCurrentUser();
    if (!user) return;
    user.education.splice(index, 1);
    saveCurrentUser(user);
    renderEducation(user);
    showToast('Education removed', 'info');
}


// ===== SKILLS CRUD =====

function renderSkills(user) {
    const container = document.getElementById('skillsList');
    if (!container) return;

    if (!user.skills || user.skills.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚡</div>
        <h4>No skills added yet</h4>
        <p>Click "Add Skill" to showcase your abilities</p>
      </div>`;
        return;
    }

    container.innerHTML = user.skills.map((skill, i) => `
    <div class="item-card">
      <div class="item-icon skill">⚡</div>
      <div class="item-content">
        <h4>${skill.name} <span class="tag" style="font-size:11px;margin-left:8px">${skill.category}</span></h4>
        <div class="skill-bar-container">
          <div class="skill-bar-bg">
            <div class="skill-bar-fill" style="width:${skill.level}%"></div>
          </div>
          <div class="skill-level">${skill.level}%</div>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn-icon" onclick="editSkill(${i})" title="Edit">✏️</button>
        <button class="btn-icon delete" onclick="deleteSkill(${i})" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');
}

function saveSkill(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;

    const idx = parseInt(document.getElementById('skillEditIndex').value);
    const entry = {
        name: document.getElementById('skillName').value.trim(),
        level: parseInt(document.getElementById('skillLevel').value),
        category: document.getElementById('skillCategory').value
    };

    if (!user.skills) user.skills = [];

    if (idx >= 0) {
        user.skills[idx] = entry;
        showToast('Skill updated!', 'success');
    } else {
        user.skills.push(entry);
        showToast('Skill added!', 'success');
    }

    saveCurrentUser(user);
    renderSkills(user);
    closeModal('skill');
}

function editSkill(index) {
    const user = getCurrentUser();
    if (!user || !user.skills[index]) return;
    const skill = user.skills[index];

    document.getElementById('skillEditIndex').value = index;
    document.getElementById('skillName').value = skill.name;
    document.getElementById('skillLevel').value = skill.level;
    document.getElementById('skillLevelValue').textContent = skill.level;
    document.getElementById('skillCategory').value = skill.category;
    document.getElementById('skillModalTitle').textContent = 'Edit Skill';

    document.getElementById('modal-skill').classList.add('active');
}

function deleteSkill(index) {
    if (!confirm('Remove this skill?')) return;
    const user = getCurrentUser();
    if (!user) return;
    user.skills.splice(index, 1);
    saveCurrentUser(user);
    renderSkills(user);
    showToast('Skill removed', 'info');
}


// ===== HOBBIES CRUD =====

function renderHobbies(user) {
    const container = document.getElementById('hobbiesList');
    if (!container) return;

    if (!user.hobbies || user.hobbies.length === 0) {
        container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🎨</div>
        <h4>No hobbies added yet</h4>
        <p>Click "Add Hobby" to share your interests</p>
      </div>`;
        return;
    }

    container.innerHTML = user.hobbies.map((hobby, i) => `
    <div class="hobby-card">
      <span class="hobby-emoji">${hobby.emoji || '🎯'}</span>
      <h4>${hobby.name}</h4>
      <p>${hobby.description || ''}</p>
      <button class="btn-icon delete hobby-delete" onclick="deleteHobby(${i})" title="Delete">🗑️</button>
    </div>
  `).join('');
}

function saveHobby(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;

    const idx = parseInt(document.getElementById('hobbyEditIndex').value);
    const entry = {
        name: document.getElementById('hobbyName').value.trim(),
        emoji: document.getElementById('hobbyEmoji').value.trim() || '🎯',
        description: document.getElementById('hobbyDescription').value.trim()
    };

    if (!user.hobbies) user.hobbies = [];

    if (idx >= 0) {
        user.hobbies[idx] = entry;
        showToast('Hobby updated!', 'success');
    } else {
        user.hobbies.push(entry);
        showToast('Hobby added!', 'success');
    }

    saveCurrentUser(user);
    renderHobbies(user);
    closeModal('hobby');
}

function deleteHobby(index) {
    if (!confirm('Remove this hobby?')) return;
    const user = getCurrentUser();
    if (!user) return;
    user.hobbies.splice(index, 1);
    saveCurrentUser(user);
    renderHobbies(user);
    showToast('Hobby removed', 'info');
}


// ===== PROJECTS CRUD =====

let currentProjectImage = '';

function handleProjectImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (ev) {
        currentProjectImage = ev.target.result;
        const upload = document.getElementById('projectImageUpload');
        const existingImg = upload.querySelector('img');
        if (existingImg) existingImg.remove();
        const img = document.createElement('img');
        img.src = currentProjectImage;
        upload.appendChild(img);
    };
    reader.readAsDataURL(file);
}

function renderProjects(user) {
    const container = document.getElementById('projectsList');
    if (!container) return;

    if (!user.projects || user.projects.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🚀</div>
        <h4>No projects added yet</h4>
        <p>Click "Add Project" to showcase your work</p>
      </div>`;
        return;
    }

    container.innerHTML = user.projects.map((proj, i) => {
        const techTags = proj.tech ? proj.tech.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('') : '';
        return `
      <div class="project-card">
        <div class="project-image">
          ${proj.image ? `<img src="${proj.image}" alt="${proj.title}">` : '<div class="placeholder">🖼️</div>'}
        </div>
        <div class="project-body">
          <h4>${proj.title}</h4>
          <p>${proj.description}</p>
          ${techTags ? `<div class="tags-container">${techTags}</div>` : ''}
          ${proj.link ? `<a href="${proj.link}" target="_blank" class="project-link" style="margin-top:12px;display:inline-flex">🔗 View Project</a>` : ''}
        </div>
        <div class="project-actions">
          <button class="btn-icon" onclick="editProject(${i})" title="Edit">✏️</button>
          <button class="btn-icon delete" onclick="deleteProject(${i})" title="Delete">🗑️</button>
        </div>
      </div>
    `;
    }).join('');
}

function saveProject(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;

    const idx = parseInt(document.getElementById('projectEditIndex').value);
    const entry = {
        title: document.getElementById('projectTitle').value.trim(),
        description: document.getElementById('projectDesc').value.trim(),
        tech: document.getElementById('projectTech').value.trim(),
        link: document.getElementById('projectLink').value.trim(),
        image: currentProjectImage || (idx >= 0 && user.projects[idx] ? user.projects[idx].image : '')
    };

    if (!user.projects) user.projects = [];

    if (idx >= 0) {
        user.projects[idx] = entry;
        showToast('Project updated!', 'success');
    } else {
        user.projects.push(entry);
        showToast('Project added!', 'success');
    }

    saveCurrentUser(user);
    renderProjects(user);
    closeModal('project');
}

function editProject(index) {
    const user = getCurrentUser();
    if (!user || !user.projects[index]) return;
    const proj = user.projects[index];

    document.getElementById('projectEditIndex').value = index;
    document.getElementById('projectTitle').value = proj.title;
    document.getElementById('projectDesc').value = proj.description;
    document.getElementById('projectTech').value = proj.tech || '';
    document.getElementById('projectLink').value = proj.link || '';
    document.getElementById('projectModalTitle').textContent = 'Edit Project';

    currentProjectImage = proj.image || '';
    const upload = document.getElementById('projectImageUpload');
    const existingImg = upload.querySelector('img');
    if (existingImg) existingImg.remove();
    if (proj.image) {
        const img = document.createElement('img');
        img.src = proj.image;
        upload.appendChild(img);
    }

    document.getElementById('modal-project').classList.add('active');
}

function deleteProject(index) {
    if (!confirm('Remove this project?')) return;
    const user = getCurrentUser();
    if (!user) return;
    user.projects.splice(index, 1);
    saveCurrentUser(user);
    renderProjects(user);
    showToast('Project removed', 'info');
}


// ===== LOGOUT =====

function handleLogout() {
    sessionStorage.removeItem('profolio_current');
    window.location.href = 'index.html';
}


// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function () {
    // Migrate: remove old users that don't have a role (from before role system)
    const users = getUsers();
    const hasOldUsers = users.some(u => !u.role);
    if (hasOldUsers) {
        const cleanUsers = users.filter(u => u.role);
        saveUsers(cleanUsers);
        sessionStorage.removeItem('profolio_current');
        // If on dashboard, redirect to login
        if (document.getElementById('sidebar')) {
            window.location.href = 'index.html';
            return;
        }
    }

    // Check if we are on the dashboard page
    if (document.getElementById('sidebar')) {
        initDashboard();
    }

    // If on index page and already logged in, redirect
    if (document.getElementById('registerForm') && sessionStorage.getItem('profolio_current')) {
        window.location.href = 'dashboard.html';
    }
});

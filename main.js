const menuButton = document.getElementById('mobile-menu');
const navContainer = document.getElementById('nav-links');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('main section[id]');

function setMenuOpen(isOpen) {
    if (!menuButton || !navContainer) return;

    navContainer.classList.toggle('active', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');

    const icon = menuButton.querySelector('i');
    if (icon) {
        icon.classList.toggle('bi-list', !isOpen);
        icon.classList.toggle('bi-x', isOpen);
    }
}

if (menuButton && navContainer) {
    menuButton.addEventListener('click', () => {
        setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') setMenuOpen(false);
    });
}

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal, .skills-block').forEach(element => {
        revealObserver.observe(element);
    });

    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const activeHref = `#${entry.target.id}`;
            navLinks.forEach(link => {
                const isActive = link.getAttribute('href') === activeHref;
                link.classList.toggle('active', isActive);
                if (isActive) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-35% 0px -55% 0px' });

    sections.forEach(section => sectionObserver.observe(section));
} else {
    document.querySelectorAll('.reveal, .skills-block').forEach(element => {
        element.classList.add('is-visible');
    });
}

const githubProfile = document.getElementById('github-profile');
const githubRepos = document.getElementById('github-repos');
const githubStatus = document.getElementById('github-status');

async function getGitHubData(endpoint) {
    const response = await fetch(`https://api.github.com${endpoint}`, {
        headers: { Accept: 'application/vnd.github+json' }
    });

    if (!response.ok) {
        throw new Error(`GitHub API merespons ${response.status}`);
    }

    return response.json();
}

function showStatus(message, includeProfileLink = false) {
    if (!githubRepos) return;

    const status = document.createElement('p');
    status.className = 'github-status';
    status.textContent = message;

    if (includeProfileLink) {
        status.append(' ');
        const link = document.createElement('a');
        link.href = 'https://github.com/renXTech-sys';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Buka profil GitHub.';
        status.append(link);
    }

    githubRepos.replaceChildren(status);
}

function renderGitHubProfile(profile) {
    const avatar = document.getElementById('github-avatar');
    const name = document.getElementById('github-name');
    const bio = document.getElementById('github-bio');
    const reposCount = document.getElementById('github-repos-count');
    const followers = document.getElementById('github-followers');

    if (avatar && profile.avatar_url) avatar.src = profile.avatar_url;
    if (name) name.textContent = profile.name || profile.login;
    if (bio) bio.textContent = profile.bio || 'Profil GitHub pribadi dan tempat menyimpan eksperimen belajar.';
    if (reposCount) reposCount.textContent = new Intl.NumberFormat('id-ID').format(profile.public_repos);
    if (followers) followers.textContent = new Intl.NumberFormat('id-ID').format(profile.followers);
}

function createRepoCard(repo) {
    const card = document.createElement('article');
    card.className = 'repo-card';

    const link = document.createElement('a');
    link.href = repo.html_url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = repo.name;

    const description = document.createElement('p');
    description.textContent = repo.description || 'Belum ada deskripsi untuk repositori ini.';

    const metadata = document.createElement('div');
    metadata.className = 'repo-meta';

    if (repo.language) {
        const language = document.createElement('span');
        language.textContent = repo.language;
        metadata.append(language);
    }

    const stars = document.createElement('span');
    stars.textContent = `★ ${new Intl.NumberFormat('id-ID').format(repo.stargazers_count)}`;
    metadata.append(stars);

    card.append(link, description, metadata);
    return card;
}

async function loadGitHubProfile() {
    if (!githubProfile) return;

    try {
        const profile = await getGitHubData('/users/renXTech-sys');
        renderGitHubProfile(profile);
    } catch (error) {
        const bio = document.getElementById('github-bio');
        if (bio) bio.textContent = 'Informasi profil sedang tidak dapat dimuat. Profil tetap bisa dibuka langsung.';
        console.error('Gagal memuat profil GitHub:', error);
    }
}

async function loadGitHubRepos() {
    if (!githubRepos) return;

    try {
        const repos = await getGitHubData('/users/renXTech-sys/repos?sort=updated&per_page=6&type=public');
        const publicRepos = repos.filter(repo => !repo.fork);

        if (githubStatus) githubStatus.remove();
        if (publicRepos.length === 0) {
            showStatus('Belum ada repositori publik untuk ditampilkan.', true);
            return;
        }

        githubRepos.replaceChildren(...publicRepos.map(createRepoCard));
    } catch (error) {
        showStatus('Repositori belum dapat dimuat. Silakan coba lagi nanti atau buka profil langsung.', true);
        console.error('Gagal memuat repositori GitHub:', error);
    }
}

const contributionGraph = document.getElementById('contributions-graph');
const contributionError = document.getElementById('contributions-error');

if (contributionGraph) {
    const showContributionError = () => {
        if (contributionError) contributionError.hidden = false;
        contributionGraph.hidden = true;
    };

    contributionGraph.addEventListener('error', showContributionError);
    contributionGraph.addEventListener('load', () => {
        contributionGraph.hidden = false;
        if (contributionError) contributionError.hidden = true;
    });

    if (contributionGraph.complete && contributionGraph.naturalWidth === 0) {
        showContributionError();
    }
}

function setupMatrixRain() {
    const canvas = document.getElementById('matrix-rain');
    const context = canvas?.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (!canvas || !context || reducedMotion.matches) return;

    const characters = '日月火水木金土山川空星夢光学力未来あいうえお';
    const fontSize = 15;
    let columns = [];
    let timerId;

    function resizeCanvas() {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = Math.floor(width * pixelRatio);
        canvas.height = Math.floor(height * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const columnCount = Math.ceil(width / fontSize);
        const activeCount = Math.max(1, Math.ceil(columnCount * 0.05));
        const activeIndexes = new Set();
        while (activeIndexes.size < activeCount) {
            activeIndexes.add(Math.floor(Math.random() * columnCount));
        }

        columns = Array.from({ length: columnCount }, (_, index) => ({
            active: activeIndexes.has(index),
            y: Math.random() * height,
            speed: 0.8 + Math.random() * 1.4
        }));
    }

    function drawMatrix() {
        const height = window.innerHeight;
        context.clearRect(0, 0, window.innerWidth, height);
        context.font = `${fontSize}px serif`;
        context.textAlign = 'center';

        columns.forEach((column, index) => {
            if (!column.active) return;

            for (let tail = 0; tail < 5; tail += 1) {
                const y = column.y - tail * fontSize;
                if (y < 0 || y > height) continue;

                context.globalAlpha = 0.6 - tail * 0.09;
                context.fillStyle = tail === 0 ? '#f06b77' : '#d84b58';
                const character = characters[Math.floor(Math.random() * characters.length)];
                context.fillText(character, index * fontSize + fontSize / 2, y);
            }

            column.y += column.speed;
            if (column.y - fontSize * 5 > height && Math.random() > 0.96) {
                column.y = -fontSize;
            }
        });

        context.globalAlpha = 1;
    }

    function startMatrix() {
        if (timerId || document.hidden) return;
        timerId = window.setInterval(drawMatrix, 110);
    }

    function stopMatrix() {
        if (!timerId) return;
        window.clearInterval(timerId);
        timerId = undefined;
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    resizeCanvas();
    startMatrix();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopMatrix();
        else startMatrix();
    });
    reducedMotion.addEventListener?.('change', event => {
        if (event.matches) stopMatrix();
        else startMatrix();
    });
}

loadGitHubProfile();
loadGitHubRepos();
setupMatrixRain();

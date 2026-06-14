document.addEventListener('DOMContentLoaded', () => {
  // Fetch image for team cards from Wikipedia page summary
  const teamCards = document.querySelectorAll('.team-card');
  teamCards.forEach(async card => {
    const titleEl = card.querySelector('h3');
    if (!titleEl) return;
    const title = titleEl.textContent.trim();
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) return;
      const data = await res.json();
      const imgSrc = (data.originalimage && data.originalimage.source) || (data.thumbnail && data.thumbnail.source);
      if (imgSrc) {
        let img = card.querySelector('img.team-logo');
        if (!img) {
          img = document.createElement('img');
          img.className = 'team-logo';
          card.insertBefore(img, titleEl);
        }
        img.src = imgSrc;
        img.alt = `${title} logo`;
      }
    } catch (e) {
      // silent fail
      // console.error('Team image lookup failed', title, e);
    }
  });

  // Fetch images for drivers
  const driverProfiles = document.querySelectorAll('.driver-profile');
  driverProfiles.forEach(async profile => {
    const nameEl = profile.querySelector('strong');
    if (!nameEl) return;
    const name = nameEl.textContent.trim();
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) return;
      const data = await res.json();
      const imgSrc = (data.originalimage && data.originalimage.source) || (data.thumbnail && data.thumbnail.source);
      if (imgSrc) {
        let img = profile.querySelector('img.driver-photo');
        if (!img) {
          img = document.createElement('img');
          img.className = 'driver-photo';
          profile.insertBefore(img, nameEl);
        }
        img.src = imgSrc;
        img.alt = `${name} photo`;
      }
    } catch (e) {
      // silent fail
      // console.error('Driver image lookup failed', name, e);
    }
  });
});

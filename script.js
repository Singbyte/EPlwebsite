// API keys and endpoints
const NEWS_API_KEY = '271a1f6fe69e4bcab15c90956b6b31d3';
const FOOTBALL_API_KEY = 'aab577d054ac4fb593dff77ebb70c726';

// Helper to get local team crest
function getTeamCrest(teamName) {
  // Convert team name to lowercase, replace spaces with underscores
  const fileName = teamName.toLowerCase().replace(/\s+/g, '_') + '.png';
  return `assets/images/teams/${fileName}`;
}

// News API
function loadNews() {
  const newsContainer = document.getElementById('news-container');
  
  fetch(`https://newsapi.org/v2/everything?q=premier+league&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`)
    .then(response => {
      if (!response.ok) throw new Error('News API request failed');
      return response.json();
    })
    .then(data => {
      newsContainer.innerHTML = '';
      const articles = data.articles.slice(0, 6);
      if (articles.length === 0) {
        newsContainer.innerHTML = '<div class="error">No news available</div>';
        return;
      }
      articles.forEach(article => {
        const card = document.createElement('div');
        card.className = 'card';
        // Use local default if missing
        const imageUrl = article.urlToImage || 'assets/images/news-default.jpg';
        card.innerHTML = `
          <img src="${imageUrl}" alt="${article.title}" onerror="this.src='assets/images/news-default.jpg'">
          <div class="card-content">
            <h3>${article.title}</h3>
            <p>${article.description || 'No description available'}</p>
            <a href="${article.url}" target="_blank">Read More</a>
          </div>
        `;
        newsContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error fetching news:', error);
      newsContainer.innerHTML = '<div class="error">Failed to load news. Please try again later.</div>';
    });
}

// League Table
function loadTable() {
  const tableContainer = document.getElementById('table-container');
  
  fetch('https://crossorigin.me/https://api.football-data.org/v4/competitions/PL/standings', {
    headers: { 'X-Auth-Token': 'aab577d054ac4fb593dff77ebb70c726' }
  })
    .then(response => {
      if (!response.ok) throw new Error('Football API request failed');
      return response.json();
    })
    .then(data => {
      tableContainer.innerHTML = '';
      const table = document.createElement('table');
      table.innerHTML = `
        <tr>
          <th>Pos</th>
          <th>Team</th>
          <th>P</th>
          <th>W</th>
          <th>D</th>
          <th>L</th>
          <th>GD</th>
          <th>Pts</th>
        </tr>
      `;
      data.standings[0].table.forEach(team => {
        const row = document.createElement('tr');
        const crest = getTeamCrest(team.team.name);
        row.innerHTML = `
          <td>${team.position}</td>
          <td class="team">
            <img src="${crest}" alt="${team.team.name}" onerror="this.src='assets/images/team-default.png'">
            ${team.team.name}
          </td>
          <td>${team.playedGames}</td>
          <td>${team.won}</td>
          <td>${team.draw}</td>
          <td>${team.lost}</td>
          <td>${team.goalDifference}</td>
          <td>${team.points}</td>
        `;
        table.appendChild(row);
      });
      tableContainer.appendChild(table);
    })
    .catch(error => {
      console.error('Error fetching table:', error);
      tableContainer.innerHTML = '<div class="error">Failed to load table. Please try again later.</div>';
    });
}

// Fixtures
function loadFixtures() {
  const fixturesContainer = document.getElementById('fixtures-container');
  
  fetch('https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED', {
    headers: { 'X-Auth-Token': 'aab577d054ac4fb593dff77ebb70c726'}
  })
    .then(response => {
      if (!response.ok) throw new Error('Football API request failed');
      return response.json();
    })
    .then(data => {
      fixturesContainer.innerHTML = '';
      const fixtures = data.matches.slice(0, 5);
      if (fixtures.length === 0) {
        fixturesContainer.innerHTML = '<p>No upcoming fixtures available</p>';
        return;
      }
      fixtures.forEach(fixture => {
        const match = document.createElement('div');
        match.className = 'match';
        const matchDate = new Date(fixture.utcDate);
        const formattedDate = matchDate.toLocaleDateString() + ' ' + 
                              matchDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const homeCrest = getTeamCrest(fixture.homeTeam.name);
        const awayCrest = getTeamCrest(fixture.awayTeam.name);
        match.innerHTML = `
          <div class="team">
            <img src="${homeCrest}" alt="${fixture.homeTeam.name}" onerror="this.src='assets/images/team-default.png'">
            <span>${fixture.homeTeam.name}</span>
          </div>
          <div>
            <div>vs</div>
            <div>${formattedDate}</div>
          </div>
          <div class="team">
            <img src="${awayCrest}" alt="${fixture.awayTeam.name}" onerror="this.src='assets/images/team-default.png'">
            <span>${fixture.awayTeam.name}</span>
          </div>
        `;
        fixturesContainer.appendChild(match);
      });
    })
    .catch(error => {
      console.error('Error fetching fixtures:', error);
      fixturesContainer.innerHTML = '<div class="error">Failed to load fixtures. Please try again later.</div>';
    });
}

// Live Scores
function loadLiveScores() {
  const liveContainer = document.getElementById('live-container');
  const noMatches = document.getElementById('no-matches');
  
  fetch('https://api.football-data.org/v4/competitions/PL/matches?status=LIVE', {
    headers: { 'X-Auth-Token': 'aab577d054ac4fb593dff77ebb70c726' }
  })
    .then(response => {
      if (!response.ok) throw new Error('Football API request failed');
      return response.json();
    })
    .then(data => {
      liveContainer.innerHTML = '';
      const matches = data.matches;
      if (matches.length === 0) {
        liveContainer.style.display = 'none';
        noMatches.style.display = 'block';
        return;
      }
      liveContainer.style.display = 'block';
      noMatches.style.display = 'none';
      matches.forEach(match => {
        const matchEl = document.createElement('div');
        matchEl.className = 'match';
        const homeCrest = getTeamCrest(match.homeTeam.name);
        const awayCrest = getTeamCrest(match.awayTeam.name);
        matchEl.innerHTML = `
          <div class="team">
            <img src="${homeCrest}" alt="${match.homeTeam.name}" onerror="this.src='assets/images/team-default.png'">
            <span>${match.homeTeam.name}</span>
          </div>
          <div>
            <div class="score">${match.score.fullTime.home || 0} - ${match.score.fullTime.away || 0}</div>
            <div>${match.minute || ''}' <span class="live-badge">LIVE</span></div>
          </div>
          <div class="team">
            <img src="${awayCrest}" alt="${match.awayTeam.name}" onerror="this.src='assets/images/team-default.png'">
            <span>${match.awayTeam.name}</span>
          </div>
        `;
        liveContainer.appendChild(matchEl);
      });
    })
    .catch(error => {
      console.error('Error fetching live scores:', error);
      liveContainer.innerHTML = '<div class="error">Failed to load live scores. Please try again later.</div>';
      liveContainer.style.display = 'block';
      noMatches.style.display = 'none';
    });
}

// Highlights
function loadHighlights() {
  const highlightsContainer = document.getElementById('highlights-container');
  fetch('https://www.scorebat.com/video-api/v3/')
    .then(response => {
      if (!response.ok) throw new Error('Highlights API request failed');
      return response.json();
    })
    .then(data => {
      highlightsContainer.innerHTML = '';
      const highlights = data.response
        .filter(video => video.competition.toLowerCase().includes('premier league'))
        .slice(0, 6);
      if (highlights.length === 0) {
        highlightsContainer.innerHTML = '<div class="error">No highlights available</div>';
        return;
      }
      highlights.forEach(highlight => {
        const card = document.createElement('div');
        card.className = 'card';
        const thumb = highlight.thumbnail || 'assets/images/highlight-default.jpg';
        card.innerHTML = `
          <img src="${thumb}" alt="${highlight.title}" onerror="this.src='assets/images/highlight-default.jpg'">
          <div class="card-content">
            <h3>${highlight.title}</h3>
            <p>${new Date(highlight.date).toLocaleDateString()}</p>
            <a href="${highlight.matchviewUrl}" target="_blank">Watch Highlights</a>
          </div>
        `;
        highlightsContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error fetching highlights:', error);
      highlightsContainer.innerHTML = '<div class="error">Failed to load highlights. Please try again later.</div>';
    });
}
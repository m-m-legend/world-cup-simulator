let simulationState = {
  isRunning: false,
  isComplete: false,
};

const API_BASE = 'http://localhost:3000/api';

async function startSimulation() {
  if (simulationState.isRunning) return;

  simulationState.isRunning = true;
  hideAllSections();
  showLoadingSpinner();
  disableButtons();

  try {
    await fetch(`${API_BASE}/simulate`);

    const response = await fetch(`${API_BASE}/state`);
    const data = await response.json();

    hideLoadingSpinner();

    displayGroups(data.groups);
    displayGroupMatches(data.groupMatches);
    displayKnockoutMatches(data.knockoutMatches);
    displayFinalResult(data.champions, data.runnerUp, data.knockoutMatches);

    simulationState.isComplete = true;
  } catch (error) {
    console.error('Erro na simulação:', error);
    showError(`Erro ao executar simulação: ${error.message}`);
    hideLoadingSpinner();
  } finally {
    simulationState.isRunning = false;
    enableButtons();
  }
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('resetBtn').style.display = 'inline-block';
}

function displayGroups(groups) {
  const container = document.getElementById('groupsContainer');
  container.innerHTML = '';

  groups.forEach((group) => {
    const groupCard = document.createElement('div');
    groupCard.className = 'group-card';

    const standings = group.teams.slice(0, 4);

    const teamsList = standings
      .map(
        (team, index) =>
          `
      <li class="team-item">
        <span>${index + 1}. ${team.name}</span>
        <span class="team-stats">
          <span>${team.played}J</span>
          <span>${team.wins}V</span>
          <span>${team.draws}E</span>
          <span>${team.losses}D</span>
          <span class="team-points">${team.points}pts</span>
        </span>
      </li>
    `,
      )
      .join('');

    groupCard.innerHTML = `
      <h3 class="group-title">Grupo ${group.name}</h3>
      <ul class="team-list">
        ${teamsList}
      </ul>
    `;

    container.appendChild(groupCard);
  });

  document.getElementById('groupsSection').style.display = 'block';
}

function displayGroupMatches(matches) {
  const container = document.getElementById('matchesContainer');
  container.innerHTML = '';

  const groupedMatches = {};

  matches.forEach((match) => {
    const groupLetter = match.id.charAt(0);
    if (!groupedMatches[groupLetter]) {
      groupedMatches[groupLetter] = [];
    }
    groupedMatches[groupLetter].push(match);
  });

  Object.keys(groupedMatches)
    .sort()
    .forEach((group) => {
      groupedMatches[group].forEach((match) => {
        const card = document.createElement('div');
        card.className = 'match-card';

        const getRound = (id) => {
          if (id.includes('R1')) return 'Rodada 1';
          if (id.includes('R2')) return 'Rodada 2';
          if (id.includes('R3')) return 'Rodada 3';
          return 'Rodada';
        };

        card.innerHTML = `
          <div class="match-round">Grupo ${group} - ${getRound(match.id)}</div>
          <div class="match-content">
            <div class="team-home">
              <span class="team-name">${match.homeTeam?.name || match.homeTeam}</span>
            </div>
            <div class="match-score">
              <div class="score-value">${match.homeGoals} x ${match.awayGoals}</div>
              <div class="score-label">Final</div>
            </div>
            <div class="team-away">
              <span class="team-name">${match.awayTeam?.name || match.awayTeam}</span>
            </div>
          </div>
        `;

        container.appendChild(card);
      });
    });

  document.getElementById('matchesSection').style.display = 'block';
}

function displayKnockoutMatches(matches) {
  const container = document.getElementById('knockoutContainer');
  container.innerHTML = '';

  const roundOrder = ['Oitavas', 'Quartas', 'Semifinal', 'Final'];
  const groupedMatches = {};

  matches.forEach((match) => {
    if (!groupedMatches[match.round]) {
      groupedMatches[match.round] = [];
    }
    groupedMatches[match.round].push(match);
  });

  roundOrder.forEach((round) => {
    if (groupedMatches[round]) {
      const roundDiv = document.createElement('div');
      roundDiv.className = 'knockout-round';

      const title = document.createElement('h4');
      title.className = 'knockout-title';
      title.textContent = round;
      roundDiv.appendChild(title);

      groupedMatches[round].forEach((match) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match-card';

        let scoreDisplay = `${match.homeGoals} x ${match.awayGoals}`;
        let scoreLabel = 'Tempo Normal';

        if (match.penaltiesHome !== undefined && match.penaltiesHome > 0) {
          scoreDisplay = `${match.homeGoals} (${match.penaltiesHome}) x (${match.penaltiesAway}) ${match.awayGoals}`;
          scoreLabel = 'Pênaltis';
        }

        matchDiv.innerHTML = `
          <div class="match-content">
            <div class="team-home">
              <span class="team-name">${match.homeTeam?.name || match.homeTeam}</span>
            </div>
            <div class="match-score">
              <div class="score-value">${scoreDisplay}</div>
              <div class="score-label">${scoreLabel}</div>
            </div>
            <div class="team-away">
              <span class="team-name">${match.awayTeam?.name || match.awayTeam}</span>
            </div>
          </div>
        `;

        roundDiv.appendChild(matchDiv);
      });

      container.appendChild(roundDiv);
    }
  });

  if (Object.keys(groupedMatches).length > 0) {
    document.getElementById('knockoutSection').style.display = 'block';
  }
}

function displayFinalResult(champions, runnerUp, knockoutMatches) {
  const container = document.getElementById('resultContainer');
  container.innerHTML = '';

  const finalMatch = knockoutMatches.find((m) => m.round === 'Final');
  if (!finalMatch) return;
  if (champions) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-container';

    let scoreText = `${finalMatch.homeGoals} x ${finalMatch.awayGoals}`;
    if (finalMatch.penaltiesHome !== undefined && finalMatch.penaltiesHome > 0) {
      scoreText = `${finalMatch.homeGoals} (${finalMatch.penaltiesHome}) x (${finalMatch.penaltiesAway}) ${finalMatch.awayGoals} (nos pênaltis)`;
    }

    resultDiv.innerHTML = `
      <div class="trophy-emoji">🏆</div>
      <div class="champion-name">${champions.name}</div>
      <div class="final-score">Vencedor da Copa do Mundo 2026</div>
      <div class="final-score">Placar Final: ${scoreText}</div>
      <div class="runner-up">
        <strong>2º lugar:</strong> ${runnerUp?.name || 'N/A'}
      </div>
    `;

    container.appendChild(resultDiv);
  }

  document.getElementById('resultSection').style.display = 'block';
}

function hideAllSections() {
  document.getElementById('groupsSection').style.display = 'none';
  document.getElementById('matchesSection').style.display = 'none';
  document.getElementById('knockoutSection').style.display = 'none';
  document.getElementById('resultSection').style.display = 'none';
  document.getElementById('errorSection').style.display = 'none';
}

function showLoadingSpinner() {
  document.getElementById('loadingSpinner').style.display = 'flex';
}

function hideLoadingSpinner() {
  document.getElementById('loadingSpinner').style.display = 'none';
}

function disableButtons() {
  document.getElementById('startBtn').disabled = true;
  document.getElementById('startBtn').style.opacity = '0.5';
}

function enableButtons() {
  document.getElementById('startBtn').disabled = false;
  document.getElementById('startBtn').style.opacity = '1';
}

function showError(message) {
  const errorSection = document.getElementById('errorSection');
  errorSection.textContent = message;
  errorSection.style.display = 'block';
}

function resetSimulation() {
  simulationState.isRunning = false;
  simulationState.isComplete = false;
  hideAllSections();
  document.getElementById('startBtn').style.display = 'inline-block';
  document.getElementById('resetBtn').style.display = 'none';
  enableButtons();
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 World Cup Simulator loaded');
  console.log()
});
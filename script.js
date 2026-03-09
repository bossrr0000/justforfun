document.getElementById('add-hint').addEventListener('click', () => {
    const container = document.getElementById('hints-container');
    const div = document.createElement('div');
    div.className = 'hint-row';
    div.innerHTML = `
        <input type="text" class="hint-word" spellcheck="false">
        <input type="number" class="hint-pos">
        <button class="remove-btn" onclick="removeHint(this)">×</button>
    `;
    container.appendChild(div);
});

function removeHint(btn) {
    const rows = document.querySelectorAll('.hint-row');
    if (rows.length > 1) {
        btn.parentElement.remove();
    } else {
        btn.parentElement.querySelectorAll('input').forEach(i => i.value = '');
    }
}

document.getElementById('search-btn').addEventListener('click', async () => {
    const wordsInput = document.querySelectorAll('.hint-word');
    const posInput = document.querySelectorAll('.hint-pos');
    const hints = [];

    wordsInput.forEach((el, i) => {
        const word = el.value.trim().toLowerCase();
        const pos = parseInt(posInput[i].value);
        if (word && !isNaN(pos)) hints.push({ word, pos });
    });

    if (hints.length === 0) return;

    const resultArea = document.getElementById('result-area');
    const progressWrapper = document.getElementById('progress-wrapper');
    const progressFill = document.getElementById('progress-fill');

    resultArea.innerHTML = "";
    progressWrapper.style.display = "block";

    let foundAny = false;

    for (let startId = 0; startId <= 1200; startId += 100) {
        progressFill.style.width = (startId / 1200) * 100 + "%";

        try {
            const response = await fetch(`./batches/batch_${startId}.json`);
            if (!response.ok) continue;
            const batchData = await response.json();

            for (const gameId in batchData) {
                const wordsList = batchData[gameId];
                
                const isMatch = hints.every(h => {
                    const targetIdx = h.pos - 1;
                    const min = Math.max(0, targetIdx - 5);
                    const max = Math.min(wordsList.length - 1, targetIdx + 5);
                    
                    return wordsList.slice(min, max + 1).some(
                        w => w && w.toLowerCase().trim() === h.word
                    );
                });

                if (isMatch) {
                    foundAny = true;
                    addResultToUI(gameId, wordsList);
                }
            }
        } catch (err) { console.error(err); }
    }

    progressWrapper.style.display = "none";
    if (!foundAny) resultArea.innerHTML = "<div class='found-card' style='border-color: #ff4b4b'>NOT FOUND</div>";
});

function addResultToUI(id, words) {
    const area = document.getElementById('result-area');
    const cardId = `grid-${id}`;
    
    const group = document.createElement('div');
    group.style.marginBottom = "15px";
    group.innerHTML = `
        <div class="found-card" onclick="toggleGrid('${cardId}')">
            <h2 style="font-size: 0.9rem">GAME #${id}</h2>
            <p style="font-size: 1.6rem; font-weight: bold; color: #6aaa64; margin: 5px 0;">${words[0].toUpperCase()}</p>
            <small style="color: #818384">Click to view list</small>
        </div>
        <div id="${cardId}" class="word-grid" style="display: none">
            ${words.map((w, i) => `<div class="word-item">${w} <span>${i+1}</span></div>`).join('')}
        </div>
    `;
    area.appendChild(group);
}

function toggleGrid(id) {
    const el = document.getElementById(id);
    el.style.display = (el.style.display === "none") ? "grid" : "none";
}

document.getElementById('add-hint').addEventListener('click', () => {
    const container = document.getElementById('hints-container');
    const div = document.createElement('div');
    div.className = 'hint-row';
    div.innerHTML = `
        <input type="text" class="hint-word" placeholder="Keyword">
        <input type="number" class="hint-pos" placeholder="Position">
    `;
    container.appendChild(div);
});

document.getElementById('search-btn').addEventListener('click', async () => {
    const wordsInput = document.querySelectorAll('.hint-word');
    const posInput = document.querySelectorAll('.hint-pos');
    const hints = [];

    wordsInput.forEach((el, i) => {
        const word = el.value.trim().toLowerCase();
        const pos = parseInt(posInput[i].value);
        if (word && !isNaN(pos)) hints.push({ word, pos });
    });

    if (hints.length === 0) return alert("Input some words!");

    const resultArea = document.getElementById('result-area');
    const progressWrapper = document.getElementById('progress-wrapper');
    const progressFill = document.getElementById('progress-fill');
    const statusText = document.getElementById('status-text');

    resultArea.innerHTML = "";
    progressWrapper.style.display = "block";

    for (let startId = 0; startId <= 1200; startId += 100) {
        const percent = (startId / 1200) * 100;
        progressFill.style.width = percent + "%";
        statusText.innerText = `Scaning: ${startId} - ${startId + 99}...`;

        try {
            const response = await fetch(`batches/batch_${startId}.json`);
            if (!response.ok) continue;
            
            const batchData = await response.json();

            for (const gameId in batchData) {
                const wordsList = batchData[gameId];
                
                const isMatch = hints.every(h => {
                    const wordAtPos = wordsList[h.pos - 1];
                    return wordAtPos && wordAtPos.toLowerCase() === h.word;
                });

                if (isMatch) {
                    progressWrapper.style.display = "none";
                    renderResult(gameId, wordsList);
                    return;
                }
            }
        } catch (err) {
            console.error(`Error loading file batch_${startId}:`, err);
        }
    }

    progressWrapper.style.display = "none";
    resultArea.innerHTML = "<p style='text-align:center; color:#ff4b4b;'>❌ Not found!</p>";
});

function renderResult(id, words) {
    const area = document.getElementById('result-area');
    let listHtml = words.map((w, i) => 
        `<div class="word-item"><b>${i + 1}.</b> ${w}</div>`
    ).join('');

    area.innerHTML = `
        <div class="found-card">
            <h2 style="color:#6aaa64; margin:0;">Found Game #${id}</h2>
            <p style="margin:10px 0;">The answer is: <b style="font-size:24px; color:white;">${words[0].toUpperCase()}</b></p>
        </div>
        <h3 style="margin-top:20px; font-size:16px; color:#6aaa64;">List of 500 related words:</h3>
        <div class="word-grid">${listHtml}</div>
    `;
}
const generatePrompt = (query) => {
    return `
  Hi,Gemini! 
  I have a word, sentence, or paragraph that I would like you to analyze.
  
  Input: ${query}
  
  Please provide the analysis in JSON format with the following structure:
  
  {
  "input": "${query}",
  "meaning": "Provide a clear and concise meaning.",
  "words": [
    {
      "word": "Extracted word",
      "meaning": "Definition of the word.",
      "synonyms": ["Similar words"],
      "antonyms": ["Opposite words"],
      "example": "Example sentence."
    }
  ],
  "idioms": [
    {
      "phrase": "Detected idiom",
      "meaning": "Definition of the idiom.",
      "example": "Example sentence."
    }
  ]
  }`;
  };
  
  const renderResult = (result) => {
    let html = `<div class="mb-3 border-bottom pb-3">
                    <h2></h2>
                    <p class="p-0 m-0" id="query">${result.input}</p><br>
                    <img src="soundon.png" height="20px" width="20px" id="soundIcon" style="cursor: pointer;">

 
          
                </div>`;
  
    // Adding sentence meaning
    html += `<h3 class="text-success">Meaning:</h3>
                <div>
                    <p class="p-0 m-0" id="meaning"> ${result.meaning}</p>
                </div><br>`;
  
    // Adding words section
    html += `<h3 class="text-success">Words:</h3>`;
    if (result.words && result.words.length > 0) {
        result.words.forEach((word) => {
            html += `<div class="mb-3">
                        <h6 class="m-0 p-0 text-capitalize">${word.word}</h6>
                        <p class="p-0 m-0">${word.meaning}</p>
                        <p class="p-0 m-0"><b class="text-primary">Example: </b> ${word.example}</p>
                        <p class="p-0 m-0"><b class="text-primary">Synonyms: </b> ${word.synonyms.join(", ")}</p>
                        <p class="p-0 m-0"><b class="text-primary">Antonyms: </b> ${word.antonyms.join(", ")}</p>
                    </div>`;
        });
    } else {
        html += `<p>No words found.</p>`;
    }
  
    // Adding idioms section
    html += `<h3 class="text-success">Idioms:</h3>`;
    if (result.idioms && result.idioms.length > 0) {
        result.idioms.forEach((idiom) => {
            html += `<div class="mb-3">
                        <h6 class="m-0 p-0 text-capitalize">${idiom.phrase}</h6>
                        <p class="p-0 m-0">${idiom.meaning}</p>
                        <p class="p-0 m-0"><b class="text-primary">Example: </b></h3> ${idiom.example}</p>
                    </div>`;
        });
    } else {
        html += `<p>No idioms found.</p>`;
    }
  
    return html;
  };
  
  // Automatically trigger popup and fetch data when text is selected
  document.addEventListener("DOMContentLoaded", () => {
    const detailsContainer = document.querySelector(".details-container");
    detailsContainer.innerHTML = "<h6>Gathering Information...</h6>";

    const historyContainer = document.createElement("div");
    historyContainer.id = "historyContainer";
    detailsContainer.appendChild(historyContainer);

    chrome.storage.local.get("selectedText", async ({ selectedText }) => {
        if (!selectedText) {
            detailsContainer.innerHTML = "<h6>No Information Available.</h6>";
            return;
        }
        const API_KEY = "your_api_key";
        const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        const prompt = generatePrompt(selectedText);
  
        try {
            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
  
            const apidata = await response.json();
            const jsonString = apidata.candidates[0].content.parts[0].text;
            const filteredJsonString = jsonString.replace(/```json|```/g, "");
            const result = JSON.parse(filteredJsonString);
  
            document.querySelector(".details-container").innerHTML = renderResult(result);
              // Save to history
              chrome.storage.local.get({ history: [] }, ({ history }) => {
                history.push(result.input);
                chrome.storage.local.set({ history });
            });

            document.querySelector(".details-container").innerHTML = renderResult(result);
            document.querySelector("#soundIcon").addEventListener("click", () => {
                const textToSpeak = result.input;
                const speech = new SpeechSynthesisUtterance(textToSpeak);
                speech.lang = "en-US";
                speech.rate = 1;
                window.speechSynthesis.speak(speech);
            });
        
}
        catch (error) {
            document.querySelector(".details-container").innerHTML = "<h6>Error fetching data. Please try again.</h6>";
        }
    });
       // View history button
    const viewHistoryBtn = document.createElement("button");
    viewHistoryBtn.textContent = "View My History";
    viewHistoryBtn.className = "btn btn-primary";
    viewHistoryBtn.style.marginTop = "10px";
    detailsContainer.appendChild(viewHistoryBtn);

    viewHistoryBtn.addEventListener("click", () => {
        chrome.storage.local.get({ history: [] }, ({ history }) => {
            historyContainer.innerHTML = "";

            if (history.length === 0) {
                historyContainer.innerHTML = "<p>No history found.</p>";
                return;
            }

            history.forEach((item, index) => {
                const historyItem = document.createElement("div");
                historyItem.className = "history-item";
                historyItem.style.display = "flex";
                historyItem.style.justifyContent = "space-between";
                historyItem.style.alignItems = "center";
                historyItem.style.margin = "5px 0";
                historyItem.style.padding = "5px";
                historyItem.style.border = "1px solid #ddd";
                historyItem.style.borderRadius = "5px";
                historyItem.style.background = "#f9f9f9";

                const historyText = document.createElement("span");
                historyText.textContent = item;
                historyText.style.flexGrow = "1";

                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "❌";
                deleteBtn.style.border = "none";
                deleteBtn.style.background = "transparent";
                deleteBtn.style.cursor = "pointer";

                deleteBtn.addEventListener("click", () => {
                    history.splice(index, 1);
                    chrome.storage.local.set({ history }, () => {
                        viewHistoryBtn.click(); // Refresh history list
                    });
                });

                historyItem.appendChild(historyText);
                historyItem.appendChild(deleteBtn);
                historyContainer.appendChild(historyItem);
            });
        });
    });
});
  

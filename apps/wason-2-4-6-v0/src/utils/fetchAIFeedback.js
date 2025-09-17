        // function to get feedback on hypothesis disproving
        export async function fetchDisprovalFeedbackOLD(userEntries) {
            // Fetch key parameter from URL
            const urlParams = new URLSearchParams(window.location.search);
            const apiKey = urlParams.get("key");
            console.log("apiKey: ", apiKey);


            let disproveFeedback = [];
            let numDisproveAttempts = 0;

            /*
            shape of userEntries:
            userEntries.push({
                entryNumber: entryCount,
                sequence: number1 + ", " + number2 + ", " + number3,
                rule: rule,
                matchesRule: isCorrect,
                confidence: confidence,
            });

            */

            // Load text from feedbackPrompt.txt
            const instructions = await fetch("./feedbackPrompt2.txt")
                .then((response) => response.text())
                .then((data) => {
                    return data;
                })
                .catch((error) => {
                    console.error(error);
                    // TODO: alert of error + cleanup execution
                    return;
                });

            console.log("instructions: ", instructions);
            console.log("userEntries: ", userEntries);

            // Convert all contents of userEntries into a readable string
            const prompt = JSON.stringify(userEntries);
            console.log(prompt);

            const jsonBody = {
                // model: "gpt-4-1106-preview", // gpt-4 vs gpt-4-1106-preview
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: `${instructions}`,
                    },
                    {
                        role: "user",
                        content: `${prompt}`,
                    },
                ],
                temperature: 1,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            };
            // Send final guess to API
            try {
                await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify(jsonBody),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        console.log(
                            "content before trim: ",
                            data.choices[0].message.content
                        );
                        const apiResponse =
                            data.choices[0].message.content.trim();
                        console.log("apiResponse: ", apiResponse);
                        // alert(apiResponse);

                        // extract disproveAttempt values from apiResponse
                        let disproveAttempts = JSON.parse(apiResponse);
                        console.log("disproveAttempts: ", disproveAttempts);
                        // iterate through disproveAttempts and log
                        for (let i = 0; i < disproveAttempts.length; i++) {
                            console.log(
                                "disproveAttempt: ",
                                disproveAttempts[i].disproveAttempt
                            );
                            disproveFeedback.push(
                                disproveAttempts[i].disproveAttempt
                            );
                            if (disproveAttempts[i].disproveAttempt === true) {
                                numDisproveAttempts++;
                            }
                        }

                        console.log('numDisproveAttempts: ', numDisproveAttempts);

                        // Render disprove attempts in tables Tried to falsify column
                        // let table = document.getElementById("resultsTable");
                        // for (let i = 0; i < disproveAttempts.length; i++) {
                        //     let cell = table.rows[i + 1].cells[4];
                        //     cell.innerHTML =
                        //         disproveAttempts[i].disproveAttempt;
                        // }
                        console.log("disproveFeedback: ", disproveFeedback);
                        return disproveFeedback;

                    })
                    .catch((error) => {
                        console.error("Error:", error);
                        alert(
                            "There was an error retrieving valid feedback from the AI model"
                        );
                    });
            } catch (error) {
                console.error(error);
            }
        }

        export async function fetchDisprovalFeedback(userEntries) {
            const urlParams = new URLSearchParams(window.location.search);
            const apiKey = urlParams.get("key");
            console.log("apiKey: ", apiKey);
        
            let disproveFeedback = [];
            let numDisproveAttempts = 0;
        
            const instructions = await fetch("./feedbackPrompt2.txt")
                .then((response) => response.text())
                .catch((error) => {
                    console.error(error);
                    return;
                });
        
            console.log("instructions: ", instructions);
            console.log("userEntries: ", userEntries);
        
            const prompt = JSON.stringify(userEntries);
            console.log(prompt);
        
            const jsonBody = {
                model: "gpt-4o",
                messages: [
                    { role: "system", content: [{
                        "type": "text",
                        "text": `${instructions}`
                    }] },
                    { role: "user", content: [{
                        "type": "text",
                        "text": `${prompt}`
                    }] },
                ],
                temperature: 1,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            };
        
            try {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify(jsonBody),
                });
        
                const data = await response.json();
                console.log("content before trim: ", data.choices[0].message.content);
                const apiResponse = data.choices[0].message.content.trim();
                console.log("apiResponse: ", apiResponse);
        
                let disproveAttempts = JSON.parse(apiResponse);
                console.log("disproveAttempts: ", disproveAttempts);
        
                for (let i = 0; i < disproveAttempts.length; i++) {
                    console.log("disproveAttempt: ", disproveAttempts[i].disproveAttempt);
                    disproveFeedback.push(disproveAttempts[i].disproveAttempt);
                    if (disproveAttempts[i].disproveAttempt === true) {
                        numDisproveAttempts++;
                    }
                }
        
                console.log('numDisproveAttempts: ', numDisproveAttempts);
                console.log("disproveFeedback: ", disproveFeedback);
        
                return disproveFeedback; // Ensure this is returned
            } catch (error) {
                console.error("Error:", error);
                alert("There was an error retrieving valid feedback from the AI model");
                return []; // Return an empty array or appropriate fallback value
            }
        }
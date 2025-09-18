const logger = require('../../../../../../packages/logging/logger.js');
        // function to get feedback on hypothesis disproving
        export async function fetchDisprovalFeedbackOLD(userEntries) {
            // Fetch key parameter from URL
            const urlParams = new URLSearchParams(window.location.search);
            const apiKey = urlParams.get("key");
            logger.app.info("apiKey: ", apiKey);


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
                    logger.app.error(error);
                    // TODO: alert of error + cleanup execution
                    return;
                });

            logger.app.info("instructions: ", instructions);
            logger.app.info("userEntries: ", userEntries);

            // Convert all contents of userEntries into a readable string
            const prompt = JSON.stringify(userEntries);
            logger.app.info(prompt);

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
                        logger.app.info(
                            "content before trim: ",
                            data.choices[0].message.content
                        );
                        const apiResponse =
                            data.choices[0].message.content.trim();
                        logger.app.info("apiResponse: ", apiResponse);
                        // alert(apiResponse);

                        // extract disproveAttempt values from apiResponse
                        let disproveAttempts = JSON.parse(apiResponse);
                        logger.app.info("disproveAttempts: ", disproveAttempts);
                        // iterate through disproveAttempts and log
                        for (let i = 0; i < disproveAttempts.length; i++) {
                            logger.app.info(
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

                        logger.app.info('numDisproveAttempts: ', numDisproveAttempts);

                        // Render disprove attempts in tables Tried to falsify column
                        // let table = document.getElementById("resultsTable");
                        // for (let i = 0; i < disproveAttempts.length; i++) {
                        //     let cell = table.rows[i + 1].cells[4];
                        //     cell.innerHTML =
                        //         disproveAttempts[i].disproveAttempt;
                        // }
                        logger.app.info("disproveFeedback: ", disproveFeedback);
                        return disproveFeedback;

                    })
                    .catch((error) => {
                        logger.app.error("Error:", error);
                        alert(
                            "There was an error retrieving valid feedback from the AI model"
                        );
                    });
            } catch (error) {
                logger.app.error(error);
            }
        }

        export async function fetchDisprovalFeedback(userEntries) {
            const urlParams = new URLSearchParams(window.location.search);
            const apiKey = urlParams.get("key");
            logger.app.info("apiKey: ", apiKey);
        
            let disproveFeedback = [];
            let numDisproveAttempts = 0;
        
            const instructions = await fetch("./feedbackPrompt2.txt")
                .then((response) => response.text())
                .catch((error) => {
                    logger.app.error(error);
                    return;
                });
        
            logger.app.info("instructions: ", instructions);
            logger.app.info("userEntries: ", userEntries);
        
            const prompt = JSON.stringify(userEntries);
            logger.app.info(prompt);
        
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
                logger.app.info("content before trim: ", data.choices[0].message.content);
                const apiResponse = data.choices[0].message.content.trim();
                logger.app.info("apiResponse: ", apiResponse);
        
                let disproveAttempts = JSON.parse(apiResponse);
                logger.app.info("disproveAttempts: ", disproveAttempts);
        
                for (let i = 0; i < disproveAttempts.length; i++) {
                    logger.app.info("disproveAttempt: ", disproveAttempts[i].disproveAttempt);
                    disproveFeedback.push(disproveAttempts[i].disproveAttempt);
                    if (disproveAttempts[i].disproveAttempt === true) {
                        numDisproveAttempts++;
                    }
                }
        
                logger.app.info('numDisproveAttempts: ', numDisproveAttempts);
                logger.app.info("disproveFeedback: ", disproveFeedback);
        
                return disproveFeedback; // Ensure this is returned
            } catch (error) {
                logger.app.error("Error:", error);
                alert("There was an error retrieving valid feedback from the AI model");
                return []; // Return an empty array or appropriate fallback value
            }
        }
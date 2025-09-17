export async function submitFeedback(answerQ1, fbtool) {
    const url = "https://api.sheety.co/f86a219e4c66ae9bacf55c87219398c1/feedbackWidgetV1Data/data1";
    const body = {
        data1: {
            id: Math.floor(Math.random() * 1000000),
            answerQ1: answerQ1,
            fbtool: fbtool,
            activityName: activityName,
            time: new Date().toISOString(),
        },
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error("Failed to submit feedback.");
        }

        const jsonResponse = await response.json();
        return jsonResponse;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

export async function fetchFeedback() {
    const url = "https://api.sheety.co/f86a219e4c66ae9bacf55c87219398c1/feedbackWidgetV1Data/data1";

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch feedback.");
        }

        const jsonResponse = await response.json();
        return jsonResponse;
    } catch (error) {
        console.error("Error:", error);
        throw error;
    }
}

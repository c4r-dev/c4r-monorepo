"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import Header from "@/app/components/header";
import "@/app/pages/compare/compare.css";
import { useRouter, useSearchParams } from "next/navigation";
// import  {Chart} from 'chartjs-react';
import Chart from 'chart.js/auto';



    // Start of Selection
    function RevisedChartComponent({consolidatedGuesses, confirmMode, currentUserTrueNum, currentUserFalseNum }) {
        const chartRef = useRef(null);
        const canvasRef = useRef(null);

        let titleText = confirmMode ? "Number of Attempts to Confirm" : "Number of Attempts to Deny";
        const {trueLabels, trueData, falseLabels, falseData} = consolidatedGuesses;

        const labels = confirmMode ? trueLabels : falseLabels;
        const currentUserValue = confirmMode ? currentUserTrueNum : currentUserFalseNum;

        useEffect(() => {
            if (canvasRef.current) {
                // Destroy existing chart if it exists
                if (chartRef.current) {
                    chartRef.current.destroy();
                }

                // Create new chart
                const ctx = canvasRef.current.getContext('2d');
                chartRef.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: titleText,
                                data: confirmMode ? trueData : falseData,
                                backgroundColor: labels.map(label => 
                                    label === currentUserValue ? '#6F00FF' : '#00A3FF'
                                ),
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 0,
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: confirmMode ? "Number of True Guesses" : "Number of False Guesses"
                                }
                            },
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: "Instances of users with this number of guesses"
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: (context) => {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed.y !== null) {
                                            label += context.parsed.y;
                                        }
                                        if (context.label === currentUserValue.toString()) {
                                            label += ' (Including your result)';
                                        }
                                        return label;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Cleanup function to destroy chart when component unmounts
            return () => {
                if (chartRef.current) {
                    chartRef.current.destroy();
                }
            };
        }, [labels, trueData, falseData, currentUserValue]);

        return (
            <div className="chart-border">
                {/* <h2>True Averages by Guess List Length</h2> */}
                <canvas className="compare-graph" ref={canvasRef} width="100%"></canvas>
            </div>
        );
    }



function CompareContent() {
    const [compareData, setCompareData] = useState(null);
    const [averagesByLength, setAveragesByLength] = useState(null);
    const [currentUserTrueNum, setCurrentUserTrueNum] = useState(null);
    const [currentUserFalseNum, setCurrentUserFalseNum] = useState(null);

    // New graphing data structure
    // const [trueCounts, setTrueCounts] = useState(null);
    // const [falseCounts, setFalseCounts] = useState(null);

    const [consolidatedGuesses, setConsolidatedGuesses] = useState(null);


    const searchParams = useSearchParams();
    const guessID = searchParams.get("guessID");

    const router = useRouter();
    const handleContinue = () => {
        router.push("/");
    }


    useEffect(() => {
        if (!guessID) return;

        const fetchCompareData = async () => {
            try {
                const response = await fetch(`/api/numberRuleGuessApi`);
                console.log("response:", response);
                const result = await response.json();
                console.log("result:", result);


                // Find the current user's true and false guesses
                const currentUser = result.find(item => item.guessID === guessID);
                console.log("currentUser:", currentUser);

                let tempTrueNum = 0;
                let tempFalseNum = 0;

                currentUser.guessList.forEach(guess => {
                    if (guess.matchesRule) {
                        tempTrueNum++;
                    } else {
                        tempFalseNum++;
                    }
                });
                setCurrentUserTrueNum(tempTrueNum);
                setCurrentUserFalseNum(tempFalseNum);

                // console.log("currentUserTrueNum:", currentUserTrueNum);
                // console.log("currentUserFalseNum:", currentUserFalseNum);




                // New graphing calculations
                 
                // - For each item in the result
                //   - For each guess in the guessList
                //     - Count the number of true and false values in the matchesRule field
                //      

                let numberOfTrueGuesses = [];
                let numberOfFalseGuesses = [];

                result.forEach(item => {
                    let trueCountInItem = 0;
                    let falseCountInItem = 0;

                    item.guessList.forEach(guess => {
                        if (guess.matchesRule) {
                            trueCountInItem++;
                        } else {
                            falseCountInItem++;
                        }
                    });

                    numberOfTrueGuesses.push(trueCountInItem);
                    numberOfFalseGuesses.push(falseCountInItem);
                });

                console.log("numberOfTrueGuesses:", numberOfTrueGuesses);
                console.log("numberOfFalseGuesses:", numberOfFalseGuesses);


                // We will graph the above data in two bar charts (One for true and one for false)
                // X axis will identify the number of guesses 
                // Y axis will be the number of occurances of that given number of guesses

                // Need a true labels array and a false labels array
                // Need a true data array and a false data array

                let tempTrueLabels = []; // For example: if the number of true gusses is 3, 3, 4, 5, 5  then tempTrueLabels is [3, 4, 5]
                let tempFalseLabels = [];

                let tempTrueData = []; // For example: if the number of true gusses is 3, 3, 4, 5, 5  then tempTrueData is [2, 1, 2]
                let tempFalseData = [];

                // Algorithm here:

                // Process true guesses
                numberOfTrueGuesses.forEach(count => {
                    const index = tempTrueLabels.indexOf(count);
                    if (index === -1) {
                        tempTrueLabels.push(count);
                        tempTrueData.push(1);
                    } else {
                        tempTrueData[index]++;
                    }
                });

                // Process false guesses
                numberOfFalseGuesses.forEach(count => {
                    const index = tempFalseLabels.indexOf(count);
                    if (index === -1) {
                        tempFalseLabels.push(count);
                        tempFalseData.push(1);
                    } else {
                        tempFalseData[index]++;
                    }
                });

                // Sort the labels and data
                const sortTrueData = () => {
                    const combined = tempTrueLabels.map((label, i) => ({ label, data: tempTrueData[i] }));
                    combined.sort((a, b) => a.label - b.label);
                    tempTrueLabels = combined.map(item => item.label);
                    tempTrueData = combined.map(item => item.data);
                };

                const sortFalseData = () => {
                    const combined = tempFalseLabels.map((label, i) => ({ label, data: tempFalseData[i] }));
                    combined.sort((a, b) => a.label - b.label);
                    tempFalseLabels = combined.map(item => item.label);
                    tempFalseData = combined.map(item => item.data);
                };

                sortTrueData();
                sortFalseData();


                let tempConsolidatedGuesses = {
                    trueLabels: tempTrueLabels,
                    trueData: tempTrueData,
                    falseLabels: tempFalseLabels,
                    falseData: tempFalseData
                }

                console.log("tempConsolidatedGuesses:", tempConsolidatedGuesses);

                setConsolidatedGuesses(tempConsolidatedGuesses);


                
                // Store each true and false counts for each guessList length. Ie: length 5 may contain the trueCounts of {3, 4, 7, 2}

                let trueCounts = [];
                let falseCounts = [];

                result.forEach(item => {
                    let trueCount = 0;
                    let falseCount = 0;
                    let guessListLength = item.guessList.length;


                    item.guessList.forEach(guess => {
                        if (guess.matchesRule) {
                            trueCount++;
                        } else {
                            falseCount++;
                        }
                    });


                    trueCounts.push({guessListLength: guessListLength, trueCount: trueCount});
                    falseCounts.push({guessListLength: guessListLength, falseCount: falseCount});
                });

                console.log("trueCounts:", trueCounts);
                console.log("falseCounts:", falseCounts);

                // For each given guessListLength, find the average of the trueCount and falseCount
                let averagesByLength = {};

                trueCounts.forEach(item => {
                    if (!averagesByLength[item.guessListLength]) {
                        averagesByLength[item.guessListLength] = { trueSum: 0, falseSum: 0, count: 0 };
                    }
                    averagesByLength[item.guessListLength].trueSum += item.trueCount;
                    averagesByLength[item.guessListLength].count++;
                });

                falseCounts.forEach(item => {
                    if (!averagesByLength[item.guessListLength]) {
                        averagesByLength[item.guessListLength] = { trueSum: 0, falseSum: 0, count: 0 };
                    }
                    averagesByLength[item.guessListLength].falseSum += item.falseCount;
                });

                for (let length in averagesByLength) {
                    averagesByLength[length].trueAverage = averagesByLength[length].trueSum / averagesByLength[length].count;
                    averagesByLength[length].falseAverage = averagesByLength[length].falseSum / averagesByLength[length].count;
                }

                setAveragesByLength(averagesByLength);

                console.log("averagesByLength:", averagesByLength);



            } catch (error) {
                console.log("Error loading results: ", error);
            }
        };

        fetchCompareData();
    }, [guessID]);


    return (
        <div className="compare-page">
            <Header />
            
            
            <div className="info-container">
               <h1>HOW MANY NUMBER SEQUENCES DID YOU TEST?</h1> 
                <div className="info-content">
                    <div className="info-text">
                        <p>Most people test number sequences that match the rule that they are thinking of. Why? Because we are human!</p>
                        <p>This tendency to seek out information that confirms beliefs or hypotheses is called “confirmation bias”.</p>
                        <p>The same number sequence could match multiple rules, however. Testing number sequences that do NOT match our rule is a way to help distinguish between these different plausible rules.</p>
                    </div>
                    <div className="chart-container">
                        {/* <div className="chart">
                            <h2>Number of Attempts to Confirm</h2>
                            {averagesByLength && <ChartComponent averagesByLength={averagesByLength} confirmMode={true} />}
                        </div>
                        <div className="chart">
                            <h2>Number of Attempts to Falsify</h2>
                            {averagesByLength && <ChartComponent averagesByLength={averagesByLength} confirmMode={false} />}
                        </div> */}
                        <div className="chart">
                            <h2>Number of Attempts to Confirm</h2>
                            {consolidatedGuesses && <RevisedChartComponent consolidatedGuesses={consolidatedGuesses} confirmMode={true} currentUserTrueNum={currentUserTrueNum} currentUserFalseNum={currentUserFalseNum} />}
                        </div>
                        <div className="chart">
                            <h2>Number of Attempts to Falsify</h2>
                            {consolidatedGuesses && <RevisedChartComponent consolidatedGuesses={consolidatedGuesses} confirmMode={false} currentUserTrueNum={currentUserTrueNum} currentUserFalseNum={currentUserFalseNum} />}
                        </div>
                    </div>
                </div>
            </div>
            <div className="button-container">
                <button onClick={handleContinue}>RESTART ACTIVITY</button>
            </div>
        </div>
    );
}

export default function Compare() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CompareContent />
        </Suspense>
    );
}
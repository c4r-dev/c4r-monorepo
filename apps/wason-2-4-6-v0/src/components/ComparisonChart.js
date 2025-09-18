const logger = require('../../../../packages/logging/logger.js');
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ComparisonChart = ( {correctGuesses, incorrectGuesses, percentDisprove, numGuesses } ) => {
  logger.app.info("correctGuesses", correctGuesses);
  logger.app.info("incorrectGuesses", incorrectGuesses);

  // Sort the correctGuesses and incorrectGuesses by numGuesses
  let sortedCorrectGuesses = correctGuesses.sort((a, b) => a.numGuesses - b.numGuesses);
  let sortedIncorrectGuesses = incorrectGuesses.sort((a, b) => a.numGuesses - b.numGuesses);

  // For each value in sortedCorrectGuesses, find all instances where numGuesses is the same and replace the percentDisprove with the average of the percentDisprove of the group
  sortedCorrectGuesses = sortedCorrectGuesses.reduce((acc, guess) => {
    const last = acc[acc.length - 1];
    if (last && last.numGuesses === guess.numGuesses) {
      last.percentDisprove = (last.percentDisprove * last.count + guess.percentDisprove) / (last.count + 1);
      last.count += 1;
    } else {
      acc.push({ ...guess, count: 1 });
    }
    return acc;
  }, []).map(({ numGuesses, percentDisprove }) => ({ numGuesses, percentDisprove }));

  sortedIncorrectGuesses = sortedIncorrectGuesses.reduce((acc, guess) => {
    const last = acc[acc.length - 1];
    if (last && last.numGuesses === guess.numGuesses) {
      last.percentDisprove = (last.percentDisprove * last.count + guess.percentDisprove) / (last.count + 1);
      last.count += 1;
    } else {
      acc.push({ ...guess, count: 1 });
    }
    return acc;
  }, []).map(({ numGuesses, percentDisprove }) => ({ numGuesses, percentDisprove }));


  logger.app.info("sortedCorrectGuesses", sortedCorrectGuesses);
  logger.app.info("sortedIncorrectGuesses", sortedIncorrectGuesses);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        // text: 'Comparison of Correct vs Incorrect Guesses',
      },
    },
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Number of Guesses'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Percent Disprove'
        }
      }
    }
  };

  const data = {
    datasets: [
      {
        label: 'Correct Guesses',
        data: sortedCorrectGuesses.map(guess => ({ x: guess.numGuesses, y: guess.percentDisprove })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Incorrect Guesses',
        data: sortedIncorrectGuesses.map(guess => ({ x: guess.numGuesses, y: guess.percentDisprove })),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Your Result',
        data: [{ x: numGuesses, y: percentDisprove }],
        pointRadius: 10,
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgb(255, 206, 86)',
      },
    ],
  };

  return <Line options={options} data={data} />;
}

export default ComparisonChart;
'use client';

import { useState } from 'react';
import styles from './CodingResourceQuiz.module.css';

interface Scores {
  git: number;
  conda: number;
  oop: number;
  llm: number;
  jupyter: number;
}

interface ResultData {
  icon: string;
  title: string;
  description: string;
}

const results: Record<keyof Scores, ResultData> = {
  git: {
    icon: "🔧",
    title: "Learn Git/GitHub Next!",
    description: "You're ready to level up your development workflow! Git and GitHub will help you track changes, collaborate with others, and manage your projects like a pro. This is the foundation skill that will serve you throughout your entire coding career."
  },
  conda: {
    icon: "🐍",
    title: "Master Conda Next!",
    description: "Environment management is your key to success! Conda will solve your package conflicts, make your projects reproducible, and streamline your data science workflow. No more 'it works on my machine' problems!"
  },
  oop: {
    icon: "🏗️",
    title: "Dive into Object-Oriented Programming!",
    description: "It's time to write cleaner, more organized code! Object-oriented programming will help you structure your projects better, make your code reusable, and think like a professional developer. Your future self will thank you!"
  },
  llm: {
    icon: "🤖",
    title: "Supercharge with AI Coding Tools!",
    description: "You're ready to boost your productivity! Learning to code with LLMs like ChatGPT and GitHub Copilot will accelerate your development, help you learn faster, and keep you on the cutting edge of modern development practices."
  },
  jupyter: {
    icon: "📓",
    title: "Explore with Jupyter Notebooks!",
    description: "Interactive coding is perfect for your learning style! Jupyter notebooks will let you experiment, visualize data, and document your learning journey all in one place. It's the ideal environment for exploration and rapid prototyping."
  }
};

export default function CodingResourceQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Scores>({
    git: 0,
    conda: 0,
    oop: 0,
    llm: 0,
    jupyter: 0
  });
  const [selectedOptions, setSelectedOptions] = useState<(string | null)[]>(Array(6).fill(null));
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      text: "What's your current coding experience level?",
      options: [
        { text: "Just starting out - wrote my first \"Hello World\" recently", value: "beginner", resource: "git" },
        { text: "I can write basic scripts and simple programs", value: "novice", resource: "jupyter" },
        { text: "I've built a few projects and feel comfortable with fundamentals", value: "intermediate", resource: "oop" },
        { text: "I'm experienced and looking to optimize my workflow", value: "advanced", resource: "llm" }
      ]
    },
    {
      text: "What type of project are you currently working on (or want to work on)?",
      options: [
        { text: "Web development or app building", value: "web", resource: "git" },
        { text: "Data analysis, machine learning, or scientific computing", value: "data", resource: "conda" },
        { text: "Software applications or complex systems", value: "software", resource: "oop" },
        { text: "Learning, experimenting, or prototyping ideas", value: "exploration", resource: "jupyter" }
      ]
    },
    {
      text: "Where do you find yourself struggling the most?",
      options: [
        { text: "Keeping track of code changes and collaborating with others", value: "versions", resource: "git" },
        { text: "Managing libraries, packages, and different versions", value: "dependencies", resource: "conda" },
        { text: "Organizing code and making it reusable/maintainable", value: "structure", resource: "oop" },
        { text: "Writing code faster and more efficiently", value: "productivity", resource: "llm" }
      ]
    },
    {
      text: "Which of these are you already comfortable with?",
      options: [
        { text: "Basic programming syntax and simple scripts", value: "basic", resource: "git" },
        { text: "Functions, loops, and basic data structures", value: "functions", resource: "jupyter" },
        { text: "Using external libraries and frameworks", value: "libraries", resource: "conda" },
        { text: "Complex programming concepts and design patterns", value: "advanced", resource: "llm" }
      ]
    },
    {
      text: "What's your main goal right now?",
      options: [
        { text: "Work better with other developers or contribute to projects", value: "collaborate", resource: "git" },
        { text: "Set up a robust environment for data science or research", value: "data-work", resource: "conda" },
        { text: "Write cleaner, more professional code", value: "better-code", resource: "oop" },
        { text: "Code faster and leverage AI tools", value: "efficiency", resource: "llm" }
      ]
    },
    {
      text: "How do you prefer to learn?",
      options: [
        { text: "Hands-on experimentation and interactive learning", value: "hands-on", resource: "jupyter" },
        { text: "Structured tutorials and building understanding step-by-step", value: "structured", resource: "oop" },
        { text: "Practical skills that solve immediate problems", value: "practical", resource: "conda" },
        { text: "Modern tools and cutting-edge techniques", value: "modern", resource: "llm" }
      ]
    }
  ];

  const startQuiz = () => {
    setCurrentQuestion(1);
  };

  const selectOption = (questionIndex: number, optionIndex: number, resource: keyof Scores) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[questionIndex] = questions[questionIndex].options[optionIndex].value;
    setSelectedOptions(newSelectedOptions);

    const newScores = { ...scores };
    newScores[resource]++;
    setScores(newScores);
  };

  const nextQuestion = () => {
    if (currentQuestion < 6) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScores({ git: 0, conda: 0, oop: 0, llm: 0, jupyter: 0 });
    setSelectedOptions(Array(6).fill(null));
    setShowResults(false);
  };

  const getResourceName = (resource: keyof Scores) => {
    const names = {
      git: 'Git/GitHub',
      conda: 'Conda',
      oop: 'Object-Oriented Programming', 
      llm: 'Coding with LLMs',
      jupyter: 'Jupyter'
    };
    return names[resource];
  };

  const getResourceDescription = (resource: keyof Scores) => {
    const descriptions = {
      git: 'Master version control and collaboration. Essential for tracking code changes, working with teams, and contributing to projects.',
      conda: 'Environment and package management made easy. Ideal for data scientists and anyone working with Python libraries.',
      oop: 'Write cleaner, more maintainable code. Learn to organize your code with classes and objects for larger applications.',
      llm: 'Supercharge your productivity with AI assistance. Use tools like ChatGPT and GitHub Copilot to code faster.',
      jupyter: 'Interactive computing and data exploration. Perfect for prototyping, data analysis, and experimenting with ideas.'
    };
    return descriptions[resource];
  };

  const getRankSuffix = (rank: number) => {
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    if (rank === 4) return 'th';
    if (rank === 5) return 'th';
    return 'th';
  };

  if (showResults) {
    const sortedResources = Object.entries(scores)
      .sort(([,a], [,b]) => b - a) as [keyof Scores, number][];
    
    const winner = sortedResources[0][0];
    const remainingResources = sortedResources.slice(1);

    return (
      <div className={styles.quizContainer}>
        <div className={styles.quizHeader}>
          <h1>🚀 What Coding Resource Should You Learn Next?</h1>
          <p>Discover your perfect next learning step in your coding journey!</p>
        </div>

        <div className={styles.quizContent}>
          <div className={`${styles.resultScreen} ${styles.active}`}>
            <div className={styles.resultIcon}>{results[winner].icon}</div>
            <div className={styles.resultTitle}>{results[winner].title}</div>
            <div className={styles.resultDescription}>{results[winner].description}</div>
            
            <div className={styles.otherResources}>
              <h3>Other resources to consider:</h3>
              <div>
                {remainingResources.map(([resource, score], index) => {
                  const rank = index + 2;
                  const rankSuffix = getRankSuffix(rank);
                  
                  return (
                    <div key={resource} className={styles.rankedResource}>
                      <h4>
                        {results[resource].icon} {getResourceName(resource)}
                        <span className={styles.rankBadge}>{rank}{rankSuffix} match</span>
                      </h4>
                      <p>{getResourceDescription(resource)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <button className={styles.restartBtn} onClick={restartQuiz}>Take Quiz Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (currentQuestion === 0) {
    return (
      <div className={styles.quizContainer}>
        <div className={styles.quizHeader}>
          <h1>🚀 What Coding Resource Should You Learn Next?</h1>
          <p>Discover your perfect next learning step in your coding journey!</p>
        </div>

        <div className={styles.quizContent}>
          <div className={styles.startScreen}>
            <p style={{ fontSize: '1.2em', color: '#666', marginBottom: '20px' }}>
              Answer 6 quick questions to get a personalized recommendation for advancing your coding skills!
            </p>
            <button className={styles.startBtn} onClick={startQuiz}>Start Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  const questionIndex = currentQuestion - 1;
  const currentQ = questions[questionIndex];
  const progressWidth = (currentQuestion / 6) * 100;

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizHeader}>
        <h1>🚀 What Coding Resource Should You Learn Next?</h1>
        <p>Discover your perfect next learning step in your coding journey!</p>
      </div>

      <div className={styles.quizContent}>
        <div className={`${styles.questionContainer} ${styles.active}`}>
          <div className={styles.progressBar}>
            <div className={styles.progress} style={{ width: `${progressWidth}%` }}></div>
          </div>
          <div className={styles.question}>
            <h2>{currentQ.text}</h2>
            <div className={styles.options}>
              {currentQ.options.map((option, index) => (
                <div
                  key={index}
                  className={`${styles.option} ${selectedOptions[questionIndex] === option.value ? styles.selected : ''}`}
                  onClick={() => selectOption(questionIndex, index, option.resource as keyof Scores)}
                >
                  {option.text}
                </div>
              ))}
            </div>
            <button
              className={styles.nextBtn}
              onClick={nextQuestion}
              disabled={selectedOptions[questionIndex] === null}
            >
              {currentQuestion === 6 ? 'Get My Results!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
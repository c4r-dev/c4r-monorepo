declare module '../public/data.json' {
  interface Question {
    Question: string | number;
    Example: string;
    'Study Description': string;
    Methodology1: string;
    Methodology2: string;
    Results1: string;
    Results2: string;
    'Level of Explanation': string;
  }
  
  const data: Question[];
  export default data;
}
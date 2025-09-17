const { createContext, useReducer } = require("react");
export const ClipFilterContext = createContext();

export const ClipFilterProvider = ({ children }) => {
  function reducer(state, action) {
    switch (action.type) {
      case "careerStage": {
        return {
          ...state,
          careerStage: action.value,
        };
      }
      case "fieldOfResearch": {
        return {
          ...state,
          fieldOfResearch: action.value,
        };
      }
      case "institution": {
        return {
          ...state,
          institution: action.value,
        };
      }
      case "rigorTopic": {
        return {
          ...state,
          rigorTopic: action.value,
        };
      }
      case "emptyfilter": {
        return {
          ...state,
          careerStage: null,
          fieldOfResearch: null,
          institution: null,
          rigorTopic: null,
        };
      }
      default: {
        return state;
      }
    }
  }
  const [filterData, dispatchFilterData] = useReducer(reducer, {
    careerStage: null,
    fieldOfResearch: null,
    institution: null,
    rigorTopic: null,
  });
  return (
    <ClipFilterContext.Provider value={{ filterData, dispatchFilterData }}>
      {children}
    </ClipFilterContext.Provider>
  );
};

"use client";
import React, { useState, useContext } from "react";
import MultipleSelector from "@/components/initials/MultipleSelector";
import { ClipFilterContext } from "@/contextapi/ClipFilterProvider";

const FilterVideoSelectors = () => {
  const { filterData, dispatchFilterData } = useContext(ClipFilterContext);
  const [careerStage, setCareerStage] = useState([]);
  const careerStageFields = [
    "Professor",
    "Postdoc",
    "PhD Student",
    "Undergraduate",
    "Other",
  ];
  const [fieldOfResearch, setFieldOfResearch] = useState([]);

  const fieldOfResearchFields = [
    "Neurobio",
    "Cog Neuro",
    "Comp Neuro",
    "Deep Learning",
    "Other",
  ];

  const [institution, setInstitution] = useState([]);

  const institutionFields = [
    "University",
    "Government",
    "Industry",
    "Start-Up",
    "Other",
  ];
  const [rigorTopic, setRigorTopic] = useState([]);

  const rigorTopicFields = [
    "P-Hacking",
    "HARKing",
    "Bias in ML",
    "Literature Review",
    "Other",
  ];
  return (
    <div className="flex space-x-2">
      <div className="w-1/2 space-y-2 text-[14px]">
        <MultipleSelector
          fields={careerStageFields}
          handleSelected={(e) => {setCareerStage(e); dispatchFilterData({type: 'careerStage',value: e})}}
        >
          Career Stage
        </MultipleSelector>
        <MultipleSelector
          fields={fieldOfResearchFields}
          handleSelected={(e) => {setFieldOfResearch(e); dispatchFilterData({type: 'fieldOfResearch',value: e})}}
        >
          Field of Research
        </MultipleSelector>
      </div>
      <div className="w-1/2 space-y-2 text-[14px]">
        <MultipleSelector
          fields={institutionFields}
          handleSelected={(e) =>{ setInstitution(e); dispatchFilterData({type: 'institution',value: e})}}
        >
          Institution
        </MultipleSelector>
        <MultipleSelector
          fields={rigorTopicFields}
          handleSelected={(e) => {setRigorTopic(e); dispatchFilterData({type: 'rigorTopic',value: e})}}
        >
          Rigor Topic
        </MultipleSelector>
      </div>
    </div>
  );
};

export default FilterVideoSelectors;

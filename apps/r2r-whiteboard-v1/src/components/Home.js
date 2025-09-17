'use client'
// React component exported as Home

import React from "react";

import {DndContext} from '@dnd-kit/core';
// import {Draggable} from './Draggable';
// import {Droppable} from './Droppable';

import Draggable from './Draggable';
import Droppable from './Droppable';

const Home = () => {
//   return <div>Home</div>;

const id = '1';

return (
    <div>
        <h1>Home</h1>
      <DndContext id={id}>
        <Draggable />
        <Droppable />
      </DndContext>
    </div>
  );

};

export default Home;
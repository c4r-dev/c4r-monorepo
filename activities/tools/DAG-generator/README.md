# DAG Generator

Dag Generator Description

This app demostrates a DAG (Directed Acyclic Graph) generator that will create a graph comprised of 3 nodes (A, B ,C) oriented in a triangle, such that A and B are at the top, and C is on the bottom. 

<img width="662" alt="Screenshot 2024-08-20 at 9 35 22 AM" src="https://github.com/user-attachments/assets/facfd259-3a65-4023-9365-44fbf5e3191e">

For use in your own project:
- Install ReactFlow (https://reactflow.dev/docs/getting-started/)
    - npm install @xyflow/react
- Copy the DagGenerator folder into your project.
- Import the DagGenerator component into your project.
- See App.js for the main component that uses the DagGenerator component.


This tool may be used by entering props for configuring the labels for the nodes and the type of edge.

Props include:
- labelA
- labelB
- labelC
- lineA
- lineB
- lineC

Prop usage:
    Labels A, B, C are the labels for the nodes and expect a string value.
    LineA, LineB, LineC are the types of edges and expect a string value for the type of edge.

    Edge types include:
    - line
    - dottedLine
    - none

Important Note: 
- The component must be wrapped within a div that has some specified height and width, and the nodes should size accordingly.
- I included a style object, dagContainerStyle, in App.js that you can use to style the container and resize the graph.



# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

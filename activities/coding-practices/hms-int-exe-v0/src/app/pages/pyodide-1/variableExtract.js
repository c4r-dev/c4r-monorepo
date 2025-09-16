function findPythonVariableDeclarations(pythonCode) {
    const declarations = [];
    // Regex to match simple variable assignments (e.g., 'x = 10', 'my_var = "hello"')
    const regex = /(\w+)\s*=\s*(.+?)(?=\n|$)/g;
    let match;
  
    while ((match = regex.exec(pythonCode)) !== null) {
      declarations.push({
        name: match[1],
        value: match[2].trim(),
      });
    }
    return declarations;
  }
  
  const pythonCode = `
  x = 10
  my_string = "hello world"
  list_of_numbers = [1, 2, 3]
  another_var = True
  `;
  
  const variables = findPythonVariableDeclarations(pythonCode);
  console.log(variables);

  
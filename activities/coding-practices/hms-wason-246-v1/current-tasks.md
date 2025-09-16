
Current tasks

- Modify the graph as needed

Completed tasks:
- Add parameter passing to each page
    - Upon load, each page will check for a "ruleID" parameter
    - If the ruleID parameter is present, the page will fetch the rule data 
    - If the ruleID parameter is not present, the page will utilize the value 1 instead.
    - Navigation between each pages should also utilize the "ruleID" parameter if it is present.
    - Note: Adding parameter checking may require refactoring each page to basically render its total contents from a small function that wraps the content in a suspense fallback.

const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

let newContent = content.replace(/<script type="module" crossorigin>[\s\S]*?<\/script>/, '<script type="module" src="./app.js"></script>');
newContent = newContent.replace(/<style rel="stylesheet" crossorigin>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="./styles.css">');

fs.writeFileSync('index.html', newContent);
console.log('index.html cleaned successfully');

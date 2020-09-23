const fs = require('fs');

const changeFile = (dir, code, cd) => {
  fs.access(dir, (err) => {
    if (!err) {
      fs.writeFile(dir, code, function (err) {
        if (err) {
          return console.log(err);
        }
        if (cd) {
          cd();
        } else {
          console.log(`成功写入!${dir}`);
        }
      });
    }
  });
}

export {
  changeFile,
}
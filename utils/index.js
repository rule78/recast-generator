const fs = require('fs');

const changeFile = (dir, code, cd) => {
  fs.access(dir, (err) => {
    if (!err) {
      fs.unlink(dir, function (err) {
        if (err) {
          console.log(err);
          return;
        }
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
      });
    }
  });
}

export {
  changeFile,
}
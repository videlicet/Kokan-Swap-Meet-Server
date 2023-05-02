import db from './db/serverIndex.js';

export const getMenus = () => {
  return new Promise(function(resolve, reject) {
    db.query('SELECT * FROM menus ORDER BY id ASC', (error, results) => {
      if (error) {
        reject(error)
      }
      resolve(results);
    });
  });
};

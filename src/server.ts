import express, { Express, Request, Response } from 'express'
import cors from 'cors'
//import { getMenus } from './content_model.js';

const app: Express = express()
const port = process.env.PORT || 3001

console.log(process.env.PORT)

app.use(cors<Request>())
app.use(express.json())

//const data = {menu: string[]};

app.get('/api/v1', (req: Request, res: Response) => {
  console.log(req.httpVersionMinor)
  console.log('Hello!')
  res.send('Express + TypeScript Server')
  /*new Promise(getMenus())
    .then(function(valArray) {
        data.menus = valArray[0];
    })*/
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`)
})
